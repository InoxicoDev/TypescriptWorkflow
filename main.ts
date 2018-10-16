import * as ns from "./Workflow/TickedWorkflow/TicketStateMachine";
import * as rq from "./Workflow/TickedWorkflow/Contracts/SupportRequest";

class Startup {
    static stateMachine = new ns.Workflow.TicketStateMachine();

    private static CompleteWorkflow() {

        Startup.stateMachine.startStep.CompleteStep(true); // TODO: Model should be optional
        let supportRequest = new rq.Workflow.SupportRequest("AC001");
        Startup.stateMachine.startStep.Support.Transition(supportRequest);
       
        Startup.stateMachine.supportStep.CompleteStep(true);
        Startup.stateMachine.supportStep.SupportProductB.Transition("Ironman figurine");

        Startup.stateMachine.supportProductB.CompleteStep(true);
        Startup.stateMachine.DisplayRemainingWorkflow();      
    }

    public static main(): number {
        console.log('This will demo the Front End Workflow structures');

        this.CompleteWorkflow();
        Startup.stateMachine.DisplayEntireWorkflow();

        Startup.stateMachine.supportStep.CompleteStep(true);  
        Startup.stateMachine.DisplayEntireWorkflow();

        return 0;
    }
}

Startup.main();