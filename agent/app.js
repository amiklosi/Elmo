var config = require("../shared/lib/config");
process.config = new config.Config(["./agent/config.json", "/home/dotcloud/environment.json"])

var agent = require("./lib/agent");


var myAgent = new agent.Agent(new agent.AgentEventEmitter(), new agent.AgentEventProcessor())

console.log("Agent Started!");