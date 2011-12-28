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
        var dirName = Math.random();
        fs.mkdir("/tmp/" + dirName, "0777", function (err) {
            log("Running: ", message.runId);
            this_.emit("start", {runId: message.runId});
            runQueue = new queue.Queue();
            _(message.steps).reduce(function (queue, step) {
                queue.enqueue(function () {
                    log("Step: ", step);
                    exec(step.body, {cwd:"/tmp/" + dirName, env:process.env}, function (error, stdout, stderr) {
                        this_.emit("step", {runId:message.runId, stdout:stdout, stderr:stderr});
                        queue.next();
                    });
                })
            }, runQueue);
            runQueue.enqueue(function () {
                this_.emit("end", {runId:message.runId});
            })

            runQueue.next();
        });
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
module.exports.JobProcessor = JobProcessor;
module.exports.Agent = Agent;