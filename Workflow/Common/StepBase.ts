import * as ob from "../Common/IObservable";
import * as obvr from "../Common/IObserver";
import * as t from "../Common/ITransition";
import * as init from "../Common/IStepInit";
import * as smbase from "../Common/StateMachineBase"

export namespace Workflow {
      export const enum DependantType { None, AllParents }

      /* [T] = Model that step provides | [TY] = Input Contract */
      export abstract class StepBase<T, TY> implements init.Workflow.IStepInit<TY>, ob.Workflow.IObservable, obvr.Workflow.IObserver {
        
        private _observers: obvr.Workflow.IObserver[];
        Name: string;
        DepenantType: DependantType; 
        IsReady: boolean = false;  
        Transitions: t.Workflow.ITransition[];
        ParentScope: smbase.Workflow.StateMachineBase;
        protected _parentName: string | null;

        private _isCompleted: boolean = false;
        IsCompleted(): boolean {
            return this._isCompleted;
        };
        
        private _model: T | null;
        get Model(): T | null {
            return this._model;
        }

        CompleteStep(model: T) {
            console.log(">> Completing step [" + this.Name + "] with [" + model + "]");                  

            let parentIsStartingStep = false;
            let firstStep = this.ParentScope.FirstStep();

			if (firstStep != null) {
				this.ParentScope.Transitions.forEach(transition => {
					let firstStepName = (firstStep) ? firstStep.Name : "NA";

					if (transition.FromStepName == firstStepName && transition.ToStepName == this.Name) {
						parentIsStartingStep = true;
					}
				});
            }
  
			if (parentIsStartingStep) {
				this.IsReady = true;
            }
            
            if (!this.IsReady) {
                throw new Error("Cannot complete step [" + this.Name + "] it is not in a ready state.");
            }

            this.ParentScope.GetChildren(this.Name).forEach(step => {
				step.IsReady = true;
			});

            console.log("Disable siblings for [" + this._parentName + "]");
            this.ParentScope.GetChildren(this._parentName).forEach(step => {
                if (step.Name != this.Name) {
					console.log("Disable sibling [" + step.Name + "]");
					step.IsReady = false;
				}	
            });
       
            if (this._model != model || this.IsCompleted() == true) {
                this.NotifyObservers();
            }  

            this._model = model;
            this._isCompleted = true;
        }      

        constructor(name: string, dependantType: DependantType, parentScope: smbase.Workflow.StateMachineBase) { 
            this.Name = name;
            this._observers = [];
            this.DepenantType = dependantType;
            this._model = null;
            this.ParentScope = parentScope;
            this.Transitions = this.ParentScope.GetStepTransitions(name);
            this._parentName = null;
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
                console.log('Step [' + this.Name + '] has been flagged for review because parent step [' + message + '] has been changed');
                this._isCompleted = false;
            }
        }
    
        abstract Initiate(input: TY, parentStepName: string) :any;
    }
}