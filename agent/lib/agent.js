var amqp = require('amqp');
var events = require('events');
var sys = require('util');
var exec = require('child_process').exec;
var _ = require("underscore")._;
var fs = require("fs");
var vessel = require("../../shared/lib/vessel");
var config = vessel.require("config");


function AgentEventEmitter() {
    var this_ = this;
    events.EventEmitter.call(this_);
    var connection = amqp.createConnection({ url:vessel.require("config").DOTCLOUD_QUEUE_AMQP_URL});
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
    this.trigger = function (event, data) {
        var eventExchange = connection.exchange('event-default', {type:'fanout'});
        data.event = event;
        eventExchange.publish('test.message', data);
    }
    this.end = function () {
        connection.end();
    }
}
sys.inherits(AgentEventEmitter, events.EventEmitter);

function JobProcessor() {
    var this_ = this;
    events.EventEmitter.call(this_);
    this.recieve = function (message) {
        console.log("Running: ", message.runId);
        _(message.steps).each(function (step) {
            console.log("Step: ", step);
            var dirName = _.uniqueId();
            fs.mkdir("~/"+dirName, function () {
                exec(step.command, {cwd:"~/"+dirName, env:process.env}, function (error, stdout, stderr) {
                    this_.emit("step", {runId:message.runId, stdout:stdout, stderr:stderr});
                });
            });

        });
        this_.emit("done", {runId:message.runId});
    }
}
sys.inherits(JobProcessor, events.EventEmitter);

function Agent() {
    var agentEventEmitter = vessel.require("agentEventEmitter");
    var agentEventProcessor = vessel.require("agentEventProcessor");
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
module.exports.AgentEventProcessor = JobProcessor;
module.exports.Agent = Agent;