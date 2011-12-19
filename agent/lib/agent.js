var amqp = require('amqp');
var events = require('events');
var sys = require('util');
var exec = require('child_process').exec;
var _ = require("underscore")._;


function AgentEventEmitter() {
    var this_ = this;
    events.EventEmitter.call(this_);
    var connection = amqp.createConnection({ url:'amqp://guest:guest@localhost:5672' });
    connection.on('ready', function () {
        var runExchange = connection.exchange('run-default', {type:'fanout'});
        var q = connection.queue('my-queue', function () {
            q.bind(runExchange, "*");
            this_.emit("ready")
            q.subscribe(function (json, headers, deliveryInfo) {
                this_.emit("message", json);
            });
        });
    });
    this.trigger = function(event, data) {
        var eventExchange = connection.exchange('event-default', {type:'fanout'});
        data.event = event;
        eventExchange.publish('test.message', data);
    }
    this.end = function () {
        connection.end();
    }
}
sys.inherits(AgentEventEmitter, events.EventEmitter);

function AgentEventProcessor() {
    var this_ = this;
    events.EventEmitter.call(this_);
    this.recieve = function (message) {
        console.log("Running: ", message.runId);
        _(message.steps).each(function (step) {
            console.log("Step: ", step);
            exec(step.command, {cwd:"/Users/jozefdransfield/Desktop/work", env: process.env}, function (error, stdout, stderr) {
                this_.emit("step", {runId: message.runId, stdout:stdout, stderr:stderr});
            });
        });
        this_.emit("done", {runId: message.runId});
    }
}
sys.inherits(AgentEventProcessor, events.EventEmitter);

function Agent(agentEventEmitter, agentEventProcessor) {
    agentEventEmitter.on("ready", function () {
        agentEventEmitter.on("message", function (message) {
            agentEventProcessor.recieve(message);
        });
    });

    // can add start here

    agentEventProcessor.on("step", function (data) {
        agentEventEmitter.trigger("step", data);
    });
    agentEventProcessor.on("done", function (data) {
        agentEventEmitter.trigger("done", data);
    })

}


module.exports.AgentEventEmitter = AgentEventEmitter;
module.exports.AgentEventProcessor = AgentEventProcessor;
module.exports.Agent = Agent;