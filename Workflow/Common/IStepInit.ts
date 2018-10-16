import * as s from "../Common/IStep";

export namespace Workflow {

    export interface IStepInit<Tin> extends s.Workflow.IStep {
        Initiate(input: Tin): any;
    }
}