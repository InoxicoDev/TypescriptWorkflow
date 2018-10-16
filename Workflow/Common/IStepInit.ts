import * as s from "../Common/IStep";

export namespace Workflow {

    export interface IStepInit<T> extends s.Workflow.IStep {
        Initiate(input: T, parentStep: string): any;
    }
}