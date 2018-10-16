import * as st from "../Common/IStep";

export namespace Workflow {

    export interface ITransition {
        FromStepName: string | null;
        ToStepName: string;
    }
}