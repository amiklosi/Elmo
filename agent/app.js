var agent = require("./lib/agent")

var myAgent = new agent.Agent(new agent.AgentEventEmitter(), new agent.AgentEventProcessor())

console.log("Agent Started!");