import * as st from "./Steps";
import * as sm from "../Common/StateMachineBase";
import * as t from "../Common/Transition";
import * as rq from "../TickedWorkflow/Contracts/SupportRequest";

export namespace Workflow {

    export class TicketStateMachine extends sm.Workflow.StateMachineBase {            

        _rootStep: st.Workflow.Steps.Start | null = null;
        get startStep(): st.Workflow.Steps.Start {
            if (this._rootStep == null) {throw new Error("Not initialized yet")}
            return this._rootStep;
        }
        set startStep(step: st.Workflow.Steps.Start) {
            this.RegisterStep(step);       
            this._rootStep = step;
        }
    
        _salesStep: st.Workflow.Steps.Sales | null = null;
        get salesStep(): st.Workflow.Steps.Sales {
            if (this._salesStep == null) {throw new Error("Not initialized yet")}
            return this._salesStep;
        }
        set salesStep(step: st.Workflow.Steps.Sales) {
            this.RegisterStep(step);
            this._salesStep = step;
        }

        _supportStep: st.Workflow.Steps.Support | null = null;
        get supportStep(): st.Workflow.Steps.Support {
            if (this._supportStep == null) {throw new Error("Not initialized yet")}
            return this._supportStep;
        }
        set supportStep(step: st.Workflow.Steps.Support) {
            this.RegisterStep(step);      
            this._supportStep = step;
        }

        _sellProductAStep: st.Workflow.Steps.SellProductA | null = null;
        get sellProductA(): st.Workflow.Steps.SellProductA {
            if (this._sellProductAStep == null) {throw new Error("Not initialized yet")}
            return this._sellProductAStep;
        }
        set sellProductA(step: st.Workflow.Steps.SellProductA) {
            this.RegisterStep(step);       
            this._sellProductAStep = step;
        }

        _sellProductBStep: st.Workflow.Steps.SellProductB | null = null;
        get sellProductB(): st.Workflow.Steps.SellProductB {
            if (this._sellProductAStep == null) {throw new Error("Not initialized yet")}
            return this._sellProductAStep;
        }
        set sellProductB(step: st.Workflow.Steps.SellProductB) {
            this.RegisterStep(step);      
            this._sellProductAStep = step;
        }

        _supportProductAStep: st.Workflow.Steps.SupportProductA | null = null;
        get supportProductA(): st.Workflow.Steps.SupportProductA {
            if (this._supportProductAStep == null) {throw new Error("Not initialized yet")}
            return this._supportProductAStep;
        }
        set supportProductA(step: st.Workflow.Steps.SupportProductA) {
            this.RegisterStep(step);
            this._supportProductAStep = step;
        }

        _supportProductBStep: st.Workflow.Steps.SupportProductB | null = null;
        get supportProductB(): st.Workflow.Steps.SupportProductB {
            if (this._supportProductBStep == null) {throw new Error("Not initialized yet")}
            return this._supportProductBStep;
        }
        set supportProductB(step: st.Workflow.Steps.SupportProductB) {
            this.RegisterStep(step);      
            this._supportProductBStep = step;
        }


        constructor() { 
            super("Job Ticket");
            
            let salesTransition = this.RegisterTransition(new t.Workflow.Transition<string>(st.Workflow.Steps.Start.Name, st.Workflow.Steps.Sales.Name, this));
            // Example of step that requires specific input
            let supportTransition = this.RegisterTransition(new t.Workflow.Transition<rq.Workflow.SupportRequest>(st.Workflow.Steps.Start.Name, st.Workflow.Steps.Support.Name, this, 
                (input: rq.Workflow.SupportRequest) => {
                    if (input.AccountNumber == '') {
                        return false;
                    }
                    return true;
                }));            
            this.startStep = new st.Workflow.Steps.Start(salesTransition, supportTransition, this);    

            let salesProductATransition = this.RegisterTransition(new t.Workflow.Transition<string>(st.Workflow.Steps.Sales.Name, st.Workflow.Steps.SellProductA.Name, this));
            let salesProductBTransition = this.RegisterTransition(new t.Workflow.Transition<string>(st.Workflow.Steps.Sales.Name, st.Workflow.Steps.SellProductB.Name, this));            
            this.salesStep = new st.Workflow.Steps.Sales(salesProductATransition, salesProductBTransition, this);  

            let supportProductATransition = this.RegisterTransition(new t.Workflow.Transition<string>(st.Workflow.Steps.Support.Name, st.Workflow.Steps.SupportProductA.Name, this));
            let supportProductBTransition = this.RegisterTransition(new t.Workflow.Transition<string>(st.Workflow.Steps.Support.Name, st.Workflow.Steps.SupportProductB.Name, this));            
            this.supportStep = new st.Workflow.Steps.Support(supportProductATransition, supportProductBTransition, this);  

            this.sellProductA = new st.Workflow.Steps.SellProductA(this);  
            this.sellProductB = new st.Workflow.Steps.SellProductB(this);  

            this.supportProductA = new st.Workflow.Steps.SupportProductA(this);  
            this.supportProductB = new st.Workflow.Steps.SupportProductB(this);  
       }     
    }
}