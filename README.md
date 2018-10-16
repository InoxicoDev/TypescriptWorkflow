# Typescript Workflow Example

## Setup
* Install latest version of NodeJS / NPM
* Clone repo and open folder in VS Code
* Build Typescript code (Cntr+Shift+B)
<img src="https://github.com/InoxicoDev/TypescriptWorkflow/blob/master/Readme/BuildTypescript.png" width="500">
* Run the following in the Powershell terminal

```bash
node main.js
```

<img src="https://github.com/InoxicoDev/TypescriptWorkflow/blob/master/Readme/Output.PNG" width="500">


## What does this approach give us:

* For each STEP
    * Individual model output on complete (Once done anyone can access this model)
    * Can only be complete when ready, only ready if parent is active step
* For each TRANSITION
    * Each transition matches to the initialization contract of the next step (Moving them around will break design time)
    * Cannot change current state unless from a valid transition (Complete parent with ready child)
    * Optional validation of destination initialization payload
* For the WORKFLOW
    * Tree structured process flow (Not liniar)
    * Current step (Status)
    * Starting Step (Root step)
    * Holistic transition validation
    * Parent step invalidation (Propogate dirty to children, revoking completed state)
    
```TypeScript
    Startup.stateMachine.startStep.CompleteStep(true); // TODO: Model should be optional
    let supportRequest = new rq.Workflow.SupportRequest("AC001");
    Startup.stateMachine.startStep.Support.Transition(supportRequest);
```
