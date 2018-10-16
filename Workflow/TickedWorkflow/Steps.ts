import * as st from "../Common/StepBase";
import * as tran from "../Common/Transition";
import * as smbase from "../Common/StateMachineBase"
import * as rq from "./Contracts/SupportRequest"

export namespace Workflow.Steps { 
    
    export class Start extends st.Workflow.StepBase<string, boolean> { 
        static readonly Name: string = "StartStep";

        constructor(    
            salesTransition: tran.Workflow.Transition<string>,
            supportTransition: tran.Workflow.Transition<rq.Workflow.SupportRequest>,
            // Prefer closure but Lexical Scoping overrides closure 'this' context
            parentContext: smbase.Workflow.StateMachineBase) {

            super(Start.Name, st.Workflow.DependantType.AllParents, parentContext);
    
            this.Sales = salesTransition;
            this.Support = supportTransition;
        }

        Sales: tran.Workflow.Transition<string>;
        Support: tran.Workflow.Transition<rq.Workflow.SupportRequest>;

        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step...");
        }   
    }

    export class Sales extends st.Workflow.StepBase<string, boolean> {  
        static readonly Name: string = "SalesStep";

        constructor(    
            salesProductA: tran.Workflow.Transition<string>,
            salesProductB: tran.Workflow.Transition<string>,
            parentContext: smbase.Workflow.StateMachineBase) { 

            super(Sales.Name, st.Workflow.DependantType.AllParents, parentContext);
    
            this.SalesProductA = salesProductA;
            this.SalesProductB = salesProductB;
        }

        SalesProductA: tran.Workflow.Transition<string>;
        SalesProductB: tran.Workflow.Transition<string>;

        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step with [" + input + "]...");
        }    
    }

    export class Support extends st.Workflow.StepBase<rq.Workflow.SupportRequest, string> {   
        static readonly Name: string = "SupportStep";
        
        constructor(        
            supportProductA: tran.Workflow.Transition<string>,
            supportProductB: tran.Workflow.Transition<string>,
            parentContext: smbase.Workflow.StateMachineBase) { 

            super(Support.Name, st.Workflow.DependantType.AllParents, parentContext);
    
            this.SupportProductA = supportProductA;
            this.SupportProductB = supportProductB;
        }

        SupportProductA: tran.Workflow.Transition<string>;
        SupportProductB: tran.Workflow.Transition<string>;

        Initiate(input: rq.Workflow.SupportRequest) {
            console.log(">> Initiating [" + this.Name + "] Step for Account [" + input.AccountNumber + "]...");
            this._model = "Customer [" + input.AccountNumber + "] has a good rating";
        }   
    }

    export class SupportProductA extends st.Workflow.StepBase<string, boolean> {
        static readonly Name: string = "SupportProductAStep";

        constructor(        
            parentContext: smbase.Workflow.StateMachineBase) {
            super(SupportProductA.Name, st.Workflow.DependantType.AllParents, parentContext);
        }

        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step with [" + input + "]...");
        }     
    }

    export class SupportProductB extends st.Workflow.StepBase<string, boolean> {
        static readonly Name: string = "SupportProductBStep";

        constructor(        
            parentContext: smbase.Workflow.StateMachineBase) {
            super(SupportProductB.Name, st.Workflow.DependantType.AllParents, parentContext);
        }

        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step with [" + input + "]...");
        }     
    }

    export class SellProductA extends st.Workflow.StepBase<string, boolean> {
        static readonly Name: string = "SellProductAStep";

        constructor(        
            parentContext: smbase.Workflow.StateMachineBase) {
            super(SellProductA.Name, st.Workflow.DependantType.AllParents, parentContext);
        }
   
        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step with [" + input + "]...");
        }    
    }

    export class SellProductB extends st.Workflow.StepBase<string, boolean> {
        static readonly Name: string = "SellProductBStep";

        constructor(        
            parentContext: smbase.Workflow.StateMachineBase) {
            super(SellProductB.Name, st.Workflow.DependantType.AllParents, parentContext);
        }
   
        Initiate(input: string) {
            console.log(">> Initiating [" + this.Name + "] Step with [" + input + "]...");
        }    
    }

}


