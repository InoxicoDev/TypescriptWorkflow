import * as t from "../Common/ITransition";
import * as tr from "../Common/Transition";
import * as s from "../Common/IStep";
import * as st from "../Common/StepBase";

export namespace Workflow {

	export abstract class StateMachineBase {
		Name: string;		
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

		GetStepTransitions(stepName: string): t.Workflow.ITransition[] {
			let list: t.Workflow.ITransition[] = [];

			this.Transitions.forEach(transition => {
				if (transition.FromStepName == stepName) {
					list.push(transition);					
				}		
			});

			return list;
		}

		RegisterTransition<Q>(transition: tr.Workflow.Transition<Q>): tr.Workflow.Transition<Q>  {
			this.Transitions.push(transition);
			return transition;
		}

		RegisterStep<T, TY>(step :st.Workflow.StepBase<T, TY>): st.Workflow.StepBase<T, TY> {
	
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
			let message: string = '';
			let childPosition: number = 0;
			
			if (path != '') {				
				path = path + '.';
			}
			path = path + parent.Name;
			level++;

			for (let index = 0; index < level; index++) {
				message = message += '*';			
			}

			message += '[' + path + '] Completed [' + parent.IsCompleted() + '] IsReady [' + parent.IsReady + ']';
			console.log(message);
		
			let children = this.GetChildren(parent.Name);
			

			children.forEach(child => {
				childPosition++;
				this.BuildWorkFlow(child, path, level, childPosition);
			});
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

	}
}