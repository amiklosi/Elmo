var config = require("../shared/lib/config");
process.config = new config.Config(["./agent/config.json", "/home/dotcloud/environment.json"])

var agent = require("./lib/agent");


var myAgent = new agent.Agent(new agent.AgentEventEmitter(), new agent.AgentEventProcessor())

console.log("Agent Started!");

//var http = require('http');
//http.createServer(function (req, res) {
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.end('Hello World\n');
//}).listen(8080, "127.0.0.1");