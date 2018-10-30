import * as obvr from "./IObserver";

export namespace Workflow {

    export interface IObservable {

        RegisterObserver(observer: obvr.Workflow.IObserver) : any;
        RemoveObserver(observer: obvr.Workflow.IObserver) : any;
        NotifyObservers(notifyId: string) : any;
    }

}