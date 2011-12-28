var vows = require('vows')
var assert = require('assert');
var amqp = require("amqp");
var mock = require("./mock");
var config = require("../../shared/lib/config");
var vessel = require("../../shared/lib/vessel");
var agent = require("../lib/agent");
var _ = require("underscore")._;

vessel.put("log", function () {
    return emptyFunction
});
vessel.put("config", function () {
    return new config.Config(["./agent/config.json", "/home/dotcloud/environment.json"])
});


vows.describe('Messaging an AgentEventEmitter').addBatch({
    'when sending a message to the default queue':{
        topic:function () {
            var _this = this;
            var agentEventEmitter = new agent.AgentEventEmitter()
            agentEventEmitter.on("ready", function () {
                setUpExchange(function (exchange) {
                    exchange.publish('test.message', {test:"message"});
                });
            });
            agentEventEmitter.on("message", function (message) {
                agentEventEmitter.end();
                _this.callback(null, message)
            });
        },
        'we recieve the message':function (topic) {
            assert.deepEqual(topic, {"test":"message"});
        }
    }
}).export(module);

vows.describe('Agent spec').addBatch({
    'when the event emitter sends a message it it passed onto the processors':{
        topic:function () {
            var this_ = this;
            var agentEventEmitter = setupMockAgentEventEmitter();
            var agentEventProcessor = setupMockJobProcessor();

            var myAgent = new agent.Agent();
            agentEventProcessor.on("message", function (message) {
                this_.callback(null, message)
            });
            agentEventEmitter.emit("ready");
            agentEventEmitter.emit("message", {"test":"message"})
        },
        'the message is recieved by the processor':function (topic) {
            assert.deepEqual(topic, {"test":"message"});
        }
    }
}).export(module);

vows.describe('Agent Processor spec tests').addBatch({
    'when processor recieves a unix command to run ':{
        topic:function () {
            var this_ = this;
            var agentEventProcessor = new agent.JobProcessor();

            var events = listenTo(agentEventProcessor, ["start", "step", "end"]);

            agentEventProcessor.on("end", function (data) {
                this_.callback(null, events)
            });
            agentEventProcessor.recieve({runId:"test", steps:[
                {type:"application/x-sh", body:"echo 'testcomplete'"}
            ]});
        },
        'the stdout is returned':function (topic) {
            assert.deepEqual(topic[0].event, "start");
            assert.deepEqual(topic[0].params.runId, "test");
            assert.deepEqual(topic[1].event, "step");
            assert.deepEqual(topic[1].params.stdout, "testcomplete\n");
            assert.deepEqual(topic[2].event, "end");
            assert.deepEqual(topic[2].params.runId, "test");
        }
    }, 'when given commands in order':{
        topic:function () {
            var this_ = this;
            var agentEventProcessor = new agent.JobProcessor();

            var events = listenTo(agentEventProcessor, ["start", "step", "end"]);

            agentEventProcessor.on("end", function (data) {
                this_.callback(null, events)
            });
            agentEventProcessor.recieve({runId:"test", steps:[
                {type:"application/x-sh", body:"echo 'test1'"},
                {type:"application/x-sh", body:"echo 'test2'"}
            ]});
        }, 'the commands are run sequentially':function (topic) {
             assert.equal(topic[1].params.stdout, "test1\n")
             assert.equal(topic[2].params.stdout, "test2\n")
        }
    }, 'when given an invalid command': {
        topic: function() {
            var this_ = this;
            var agentEventProcessor = new agent.JobProcessor();

            var events = listenTo(agentEventProcessor, ["start", "step", "end"]);

            agentEventProcessor.on("end", function (data) {
                this_.callback(null, events)
            });
            agentEventProcessor.recieve({runId:"test", steps:[
                {type:"application/x-sh", body:"unknown"}
            ]});
        }, "the step is returned as failure": function(topic) {
            assert.equal(topic[1].params.success, false);
        }
    }
}).export(module);

function setUpExchange(callback) {
    var connection = amqp.createConnection({ url:'amqp://guest:guest@localhost:5672' });
    connection.on('ready', function () {
        callback(connection.exchange('run-default', {type:'fanout'}));
    });
}

function setupMockAgentEventEmitter() {
    var agentEventEmitter = new mock.AgentEventEmitter()
    vessel.put("agentEventEmitter", agentEventEmitter);
    return agentEventEmitter;
}

function setupMockJobProcessor() {
    var jobProcessor = new mock.JobProcessor();
    vessel.put("agentEventProcessor", jobProcessor);
    return jobProcessor
}

function emptyFunction() {
}

function listenTo(eventEmitter, events) {
    var recordedEvents = []
    _(events).each(function (event) {
        eventEmitter.on(event, function (params) {
            recordedEvents.push({event:event, params:params});
        })
    });
    return recordedEvents;
}
