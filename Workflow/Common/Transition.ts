import * as t from "./ITransition";
import * as init from "./IStepInit";
import * as smbase from "./StateMachineBase"

export namespace Workflow {

    export class Transition<Tin> implements t.Workflow.ITransition {
        IsPrimary: boolean = false;
        FromStepName: string | null;
        ToStepName: string;
        ParentContext: smbase.Workflow.StateMachineBase;
        
        ValidateInput: ((input: Tin) => boolean) | null;

        Transition(input: Tin, isPrimary: boolean = false): boolean {     
            if (this.ValidateInput != null && !this.ValidateInput(input)) {
                throw new Error("Unable to transition to [" + this.ToStepName + "] validation failed for inout of type [" + input + "]");
            }
            
            let nextStep = this.ParentContext.GetStep(this.ToStepName) as init.Workflow.IStepInit<Tin>;
            if (nextStep == null) {
                throw new Error("Could not find next step [" + this.ToStepName + "]");
            }

            this.ParentContext.StepTransition(this.ToStepName);
            nextStep.ParentStepName = this.FromStepName;
            
            if (this.FromStepName) {
                let fromStep = this.ParentContext.GetStep(this.FromStepName);

                if (fromStep) {
                    fromStep.RegisterObserver(nextStep);
                }                
            }

            this.IsPrimary = isPrimary;
            
            nextStep.Initiate(input);
            return true;
        }

        constructor(
                fromStepName: string | null, 
                toStepName: string,
                parentContext: smbase.Workflow.StateMachineBase,
                customInputValidation: ((input: Tin) => boolean) | null = null,
                isPrimary: boolean = false) { 
			this.FromStepName = fromStepName;
            this.ToStepName = toStepName;
            this.ParentContext = parentContext;
            this.ValidateInput = customInputValidation;
            this.IsPrimary = isPrimary;
		} 
    }
}