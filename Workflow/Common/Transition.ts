import * as t from "./ITransition";
import * as init from "./IStepInit";
import * as smbase from "./StateMachineBase"

export namespace Workflow {

    export class Transition<T> implements t.Workflow.ITransition {
        FromStepName: string | null;
        ToStepName: string;
        ParentContext: smbase.Workflow.StateMachineBase;
        
        ValidateInput: ((input: T) => boolean) | null;

        Transition(input: T): boolean {     
            if (this.ValidateInput != null && !this.ValidateInput(input)) {
                throw new Error("Unable to transition to [" + this.ToStepName + "] validation failed for inout of type [" + input + "]");
            }
            
            let nextStep = this.ParentContext.GetStep(this.ToStepName) as init.Workflow.IStepInit<T>;
            if (nextStep == null) {
                throw new Error("Could not find next step [" + this.ToStepName + "]");
            }

            this.ParentContext.StepTransition(this.ToStepName);
            let fromStepName = (this.FromStepName) ? this.FromStepName : "N/A";

            nextStep.Initiate(input, fromStepName);
            return true;
        }

        constructor(
                fromStepName: string | null, 
                toStepName: string,
                parentContext: smbase.Workflow.StateMachineBase,
                customInputValidation: ((input: T) => boolean) | null = null) { 
			this.FromStepName = fromStepName;
            this.ToStepName = toStepName;
            this.ParentContext = parentContext;
            this.ValidateInput = customInputValidation;
		} 
    }
}