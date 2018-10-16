import * as t from "../Common/ITransition";

export namespace Workflow {

    export interface IStep {
        Name: string;
        IsCompleted(): boolean;
        IsReady: boolean;
    }
}