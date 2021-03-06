import * as ns from "./Workflow/TickedWorkflow/TicketStateMachine";
import * as rq from "./Workflow/TickedWorkflow/Contracts/SupportRequest";

class Startup {
    static stateMachine = new ns.Workflow.TicketStateMachine();

    private static AccountNumber: string = "AC001";

    private static CompleteWorkflow() {

        let menus = Startup.stateMachine.DisplayPrimaryPath().reverse();
        console.log();
        console.log("------------------------------------------------------------");
        console.log("Menu paths: " + menus.join(" > "));
        console.log("------------------------------------------------------------");
        console.log();

        Startup.stateMachine.startStep.Initiate()
        Startup.stateMachine.startStep.CompleteStep();
        let supportRequest = new rq.Workflow.SupportRequest(this.AccountNumber);
        Startup.stateMachine.startStep.Support.Transition(supportRequest);
       
        Startup.stateMachine.supportStep.CompleteStep();
        Startup.stateMachine.supportStep.SupportProductB.Transition("Ironman figurine");

        Startup.stateMachine.supportProductB.CompleteStep(true);
        Startup.stateMachine.DisplayRemainingWorkflow();      
    }

    public static main(): number {
        console.log('This will demo the Front End Workflow structures');

        this.CompleteWorkflow();
        // Show workflow in state completed
        Startup.stateMachine.DisplayEntireWorkflow();

        Startup.stateMachine.supportStep.CompleteStep(); 
        // Show workflow with last step undone because of change 
        Startup.stateMachine.DisplayEntireWorkflow();

        let stepOutputModel = Startup.stateMachine.supportStep.Model;
        console.log(stepOutputModel);

        return 0;
    }
}

Startup.main();