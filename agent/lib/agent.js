var amqp = require('amqp');
var events = require('events');
var sys = require('util');
var exec = require('child_process').exec;
var _ = require("underscore")._;
var fs = require("fs");
var vessel = require("../../shared/lib/vessel");
var queue = require("../../shared/lib/queue");


function AgentEventEmitter() {
    var this_ = this;
    events.EventEmitter.call(this_);
    var config = vessel.require("config");
    var connection = amqp.createConnection({ url:config.DOTCLOUD_QUEUE_AMQP_URL});
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
    var log = vessel.require("log");
    events.EventEmitter.call(this_);
    this.recieve = function (message) {
        var dirName = "/tmp/" + Math.random();
        fs.mkdir(dirName, "0777", function (err) {
            log("Running: ", message.runId);
            this_.emit("start", {runId:message.runId});
            var runQueue = _(message.steps).reduce(toEmittingQueue(this_, message, dirName, log), new queue.Queue());
            runQueue.enqueue(function () {
                this_.emit("end", {runId:message.runId});
            })
            runQueue.next();
        });
    }
}

function toEmittingQueue(eventEmitter, message, directoryName, log) {
    return function (queue, step) {
        queue.enqueue(function () {
            log("Step: ", step);
            exec(step.body, {cwd:directoryName, env:process.env}, function (error, stdout, stderr) {
                var success = true;
                if (error) {
                    success = false
                }
                eventEmitter.emit("step", {runId:message.runId, stdout:stdout, stderr:stderr, success: success});
                queue.next();
            });
        });
        return queue;
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

    agentEventProcessor.on("start", function (data) {
        agentEventEmitter.trigger("start", data);
    });
    agentEventProcessor.on("step", function (data) {
        agentEventEmitter.trigger("step", data);
    });
    agentEventProcessor.on("end", function (data) {
        agentEventEmitter.trigger("end", data);
    })

}


module.exports.AgentEventEmitter = AgentEventEmitter;
module.exports.JobProcessor = JobProcessor;
module.exports.Agent = Agent;