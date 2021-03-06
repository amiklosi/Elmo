var vessel = require("../shared/lib/vessel");
var agent = require("./lib/agent");
var config = require("../shared/lib/config");

vessel.put("log", function() {return console.log });
vessel.put("config", new config.Config(["./agent/config.json", "/home/dotcloud/environment.json"]));
vessel.put("agentEventEmitter", new agent.AgentEventEmitter())
vessel.put("agentEventProcessor", new agent.JobProcessor())
vessel.put("agent", new agent.Agent());
vessel.put("workingDirectory", "/tmp/")

vessel.require("agent");

console.log("Agent Started!");