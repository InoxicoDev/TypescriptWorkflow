export namespace Workflow {
    export interface IObserver {
        ReceiveNotification<T>(message: T): void;
    }
}