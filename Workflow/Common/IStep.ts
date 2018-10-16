import * as obs from "../Common/IObserver";
import * as obsble from "../Common/IObservable";

export namespace Workflow {

    export interface IStep extends obs.Workflow.IObserver, obsble.Workflow.IObservable  {
        Name: string;
        IsCompleted(): boolean;
        IsReady: boolean;
        ParentStepName: string | null;
    }
}