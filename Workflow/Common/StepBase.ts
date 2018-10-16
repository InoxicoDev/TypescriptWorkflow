import * as ob from "../Common/IObservable";
import * as obvr from "../Common/IObserver";
import * as t from "../Common/ITransition";
import * as init from "../Common/IStepInit";
import * as smbase from "../Common/StateMachineBase"

export namespace Workflow {
      export const enum DependantType { None, AllParents }

      /* [Tin = Input contract for Step Initialization | [Tout] = Step output model */
      export abstract class StepBase<Tin, Tout> implements init.Workflow.IStepInit<Tin>, ob.Workflow.IObservable, obvr.Workflow.IObserver {
        ParentStepName: string | null;        
        private _observers: obvr.Workflow.IObserver[];
        Name: string;
        DepenantType: DependantType; 
        IsReady: boolean = false;  
        Transitions: t.Workflow.ITransition[];
        // Not crazy about this, would have prefered a closure but with Lexical Scoping this is not transferred 
        WorkflowScope: smbase.Workflow.StateMachineBase;

        private _isCompleted: boolean = false;
        IsCompleted(): boolean {
            return this._isCompleted;
        };
        
        protected _model: Tout | null;
        get Model(): Tout | null {
            return this._model;
        }

        CompleteStep(model: Tout | null = null) {
            if (model != null)
            {
                this._model = model;
            }

            if (this.Model == null) {
                throw new Error("Cannot complete step [" + this.Name + "] until output model have been set. Parameter [" + model + "] Model [" + this.Model + "]");
            }

            console.log(">> Completing step [" + this.Name + "] with [" + this.Model + "]");                  

            let parentIsStartingStep = false;
            let firstStep = this.WorkflowScope.FirstStep();
            let isStartingStep = firstStep != null && firstStep.Name == this.Name;

			if (firstStep != null) {
				this.WorkflowScope.Transitions.forEach(transition => {
					let firstStepName = (firstStep) ? firstStep.Name : "NA";

					if (transition.FromStepName == firstStepName && transition.ToStepName == this.Name) {
						parentIsStartingStep = true;
					}
				});
            }
  
			if (isStartingStep || parentIsStartingStep) {
				this.IsReady = true;
            }
            
            if (!this.IsReady) {
                throw new Error("Cannot complete step [" + this.Name + "] it is not in a ready state.");
            }

            this.WorkflowScope.GetChildren(this.Name).forEach(step => {
				step.IsReady = true;
			});

            if (!isStartingStep) {
                if (!this.ParentStepName) {
                    console.warn("Unable to disable siblings of completed step because parent was not defined during initialization. [" + this.Name + "]");
                }
                else {
                    this.WorkflowScope.GetChildren(this.ParentStepName).forEach(step => {
                        if (step.Name != this.Name) {
                            step.IsReady = false;
                        }	
                    });
                }
            }       
       
            if (this.IsCompleted() == true) {
                this.NotifyObservers();
            }  

            this._isCompleted = true;
        }      

        constructor(name: string, dependantType: DependantType, parentScope: smbase.Workflow.StateMachineBase) { 
            this.Name = name;
            this._observers = [];
            this.DepenantType = dependantType;
            this._model = null;
            this.WorkflowScope = parentScope;
            this.Transitions = this.WorkflowScope.GetStepTransitions(name);
            this.ParentStepName = null;
        }

        RegisterObserver(observer: obvr.Workflow.IObserver) {
            this._observers.push(observer);
        }

        NotifyObservers() {
            for (let i = 0; i < this._observers.length; i++) {
                this._observers[i].ReceiveNotification(this.Name);
            }
        }

        RemoveObserver(observer: obvr.Workflow.IObserver) {
            for (let i = 0; i < this._observers.length; i++) {
                if (this._observers[i] === observer) {
                    this._observers.splice(i,1);
                }
            }
        }

        ReceiveNotification<T>(message: T): void {            
            if (this.DepenantType == DependantType.AllParents) {
                console.log('Step [' + this.Name + '] is no longer completed because its parent step [' + message + '] has been changed');
                this._isCompleted = false;
            }

            this.NotifyObservers();
        }
    
        abstract Initiate(input: Tin | null) :any;
    }
}