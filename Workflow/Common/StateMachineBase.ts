import * as t from "../Common/ITransition";
import * as tr from "../Common/Transition";
import * as s from "../Common/IStep";
import * as st from "../Common/StepBase";

export namespace Workflow {

	export abstract class StateMachineBase {
		Name: string;
		IsValid: boolean | null = null;

		private _currentStep: s.Workflow.IStep | null = null;
		public CurrentStep(): s.Workflow.IStep | null  {
			return this._currentStep;
		}

		private _firstStep: s.Workflow.IStep | null = null;
		public FirstStep(): s.Workflow.IStep | null  {
			return this._firstStep;
		}

		Steps: s.Workflow.IStep[];
		Transitions: t.Workflow.ITransition[];

		constructor(name: string) { 
			this.Name = name;
			this.Steps = [];
			this.Transitions = []
		}

		public StepTransition(nextStepName: string): any {
			
			if (this.IsValid == null) {
				let exceptions = this.ValidateWorkflow();

				if (exceptions.length > 0) {
					console.error("Workflow invalid:");

					exceptions.forEach(ex => {
						console.error("- " + ex);
					});
				}				
			}

			if (this.IsValid == false) {
				throw new Error("Workflow invalid, cannot make any transition.");
			}

			let currentStepName = (this._currentStep != null) ? this._currentStep.Name : "N/A";
			let foundMatchingTransition = false;

			if (this._currentStep == null || !this._currentStep.IsCompleted()) {
				throw new Error("Cannot transition to step [" + nextStepName + "] if step [" + currentStepName + "] is not yet completed.");
			}

			this.Transitions.forEach(transition => {				
				if (transition.FromStepName == currentStepName && transition.ToStepName == nextStepName){
					foundMatchingTransition = true;
				}							
			});		

			if (!foundMatchingTransition) {
				throw new Error("Invalid transition attempted. Cannot transition from [" + currentStepName + "] to [" + nextStepName + "]");	
			}

			let nextStep = this.GetStep(nextStepName);

			if (nextStep == null || !nextStep.IsReady) {
				throw new Error("Cannot transition to step [" + nextStepName + "] is has to available and in a Ready state.");
			}
			
			this._currentStep = nextStep;		
		}

		ValidateStep(step: s.Workflow.IStep): boolean {
			let transitions = this.GetStepTransitions(step.Name);
			let foundOne: boolean = false;

			if (transitions.length == 0)
			{
				return true;
			}

			transitions.forEach(transition => {

				if (transitions.length == 1) {
					transition.IsPrimary = true;
				}

				if (!foundOne && transition.IsPrimary) {
					foundOne = true;
				}
				else if (transition.IsPrimary) {
					console.log("Multiple Primary transitions found [" + step.Name + "]");
					return false;
				}				
			});

			if (!foundOne) { 
				console.log("No Primary transitions found [" + step.Name + "]");
			}

			return foundOne;
		}

		ValidateRecursive(step: s.Workflow.IStep): string[] {
			let steps = this.GetChildren(step.Name);
			let exceptions : Array<string> = [];

			steps.forEach(step => {
				if (!this.ValidateStep(step)) {
					exceptions.push("Transition for step [" + step.Name + "] incorrect. Must have (only) one primary transition.");
				}
				
				let childExceptions = this.ValidateRecursive(step);

				childExceptions.forEach(ex => {
					exceptions.push(ex);
				});				
			});
			
			return exceptions;			
		}

		ValidateWorkflow(): string[] {
			let exceptions: Array<string> = [];

			if (this.FirstStep() == null) {
				exceptions.push("No root node specified.");
				return exceptions;
			}

			let firstStep = <s.Workflow.IStep>this.FirstStep();

			if (!this.ValidateStep(firstStep)) {
				exceptions.push("Transition for step [" + firstStep.Name + "] incorrect. Must have only one primary transition.");
			}
			
			exceptions = this.ValidateRecursive(firstStep);	

			if (exceptions.length > 0) {
				this.IsValid = false;
			}
			else {
				this.IsValid = true;
			}

			return exceptions;
		}

		GetStepTransitions(stepName: string): t.Workflow.ITransition[] {
			let list: t.Workflow.ITransition[] = [];

			this.Transitions.forEach(transition => {
				if (transition.FromStepName == stepName) {
					list.push(transition);					
				}		
			});

			return list;
		}

		RegisterTransition<Tin>(transition: tr.Workflow.Transition<Tin>): tr.Workflow.Transition<Tin>  {
			this.Transitions.push(transition);
			return transition;
		}

		RegisterStep<Tin, Tout>(step :st.Workflow.StepBase<Tin, Tout>): st.Workflow.StepBase<Tin, Tout> {
	
			if (this._currentStep != null) {
				let foundParent: boolean = false;

				this.Transitions.forEach(transition => {					
					if (transition.ToStepName == step.Name) {
						foundParent = true;
					}
				});

				if (!foundParent) {
					throw new Error('Cannot add a step without declaring their parents first! [' + step.Name + ']');
				}
			}

			if (this.Steps == null || this.Steps.length == 0) {
				this.Transitions.forEach(transition => {
					if (transition.ToStepName == step.Name) {
						throw new Error('The first step must be a ROOT step with no parent step! Step [' + step.Name + ']');
					}
				});

				step.IsReady = true;
				this._currentStep = this._firstStep = step;	
			}

			let parentIsStartingStep = false;
			if (this._currentStep != null) {
				this.Transitions.forEach(transition => {
					let currentStepName = (this._currentStep) ? this._currentStep.Name : "N/A";

					if (transition.FromStepName == currentStepName && transition.ToStepName == step.Name) {
						parentIsStartingStep = true;
					}
				});
			}

			if (parentIsStartingStep) {
				step.IsReady = true;
			}

			if (this.GetStep(step.Name) != null) {
				throw new Error('Step name already exists! [' + step.Name + ']');
			}
			
			if (this.Steps != null) {				
				this.Steps.push(step);
			}
			
            return step;
        }		

		GetChildren(stepName: string | null): s.Workflow.IStep[] {
			let children: s.Workflow.IStep[] = [];

			for (let transition of this.Transitions) {
				if (transition.FromStepName == stepName) {
					let child = this.GetStep(transition.ToStepName);

					if (child != null) {
						children.push(child);
					}					
				}			
			}

			return children;
		}

		GetStep(stepName: string): s.Workflow.IStep | null {
			if (stepName == null || this.Steps == null) {
				return null;
			}

			for (let step of this.Steps) {
				if (step.Name == stepName) {
					return step
				}			
			}

			return null;
		}
		
		BuildWorkFlow(parent: s.Workflow.IStep, path: string, level: number, position: number) {
			let message: string = "";
			let childPosition: number = 0;
			
			if (path != "") {				
				path = path + ".";
			}
			path = path + parent.Name;
			level++;

			for (let index = 0; index < level; index++) {			
				if (index == level - 1) {
					message += "|\_";	
					continue;
				}

				message += "|";
			}

			message += " [" + path + "] Completed [" + parent.IsCompleted() + "] IsReady [" + parent.IsReady + "]";
			console.log(message);
		
			let children = this.GetChildren(parent.Name);
			
			for (let index = 0; index < children.length; index++) {
				const child = children[index];

				this.BuildWorkFlow(child, path, level, childPosition);		
			}
		}

		private DisplayFromStep(step: s.Workflow.IStep) {
			console.log();
			console.log("Options starting from [" + step.Name + "]");
			console.log("====================================================================");

			this.BuildWorkFlow(step, '', 0, 0);			
			console.log();
		}

		DisplayRemainingWorkflow() {
			let currentStep = this._currentStep;
			
			if (currentStep == null) {
				return;
			}

			this.DisplayFromStep(currentStep);
		}

		DisplayEntireWorkflow() {
			let currentStep = this._firstStep;
			
			if (currentStep == null) {
				return;
			}

			this.DisplayFromStep(currentStep);
		}

		DisplayPrimaryPath(step: s.Workflow.IStep = <s.Workflow.IStep>this.FirstStep(), primaryPaths: string[] = []) : string[] {
			let transitions = this.GetStepTransitions(step.Name);
			let primPath: Array<string> = [];			

			transitions.forEach(childTransition => {
				if (childTransition.IsPrimary) {
					let child = <s.Workflow.IStep>this.GetStep(childTransition.ToStepName);
					let paths = this.DisplayPrimaryPath(child, primaryPaths);

					paths.forEach(path => {
						primPath.push(path);
					});
				}
			});

			primPath.push(step.Name);

			return primPath;
		}
	}
}