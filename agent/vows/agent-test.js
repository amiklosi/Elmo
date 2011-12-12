var vows = require('vows')
var assert = require('assert');
var amqp = require("amqp");
var mock = require("./mock")

var agent = require("../lib/agent.js");


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
            agentEventEmitter.on("message", function(message) {
                agentEventEmitter.end();
                _this.callback(null, message)
            });
        },
        'we recieve the message':function (topic) {
            assert.deepEqual(topic, {"test": "message"});
        }
    }
}).export(module);

vows.describe('Agent spec').addBatch({
    'when the event emitter sends a message it it passed onto the processors':{
        topic:function () {
            var this_ = this;
            var agentEventEmitter = new mock.AgentEventEmitter();
            var agentEventProcessor = new mock.AgentEventProcessor();
            var myAgent = new agent.Agent(agentEventEmitter, agentEventProcessor);
            agentEventProcessor.on("message", function(message) {
                this_.callback(null, message)
            });
            agentEventEmitter.emit("ready");
            agentEventEmitter.emit("message", {"test": "message"})
        },
        'the message is recieved by the processor':function (topic) {
            assert.deepEqual(topic, {"test": "message"});
        }
    }
}).export(module);

vows.describe('Agent Processor spec tests').addBatch({
    'when process recieves a command to run time':{
        topic:function () {
            var this_ = this;
            var agentEventProcessor = new agent.AgentEventProcessor();
            agentEventProcessor.on("step", function(data) {
                  this_.callback(null, data)
            });
            agentEventProcessor.recieve({command: "pwd"});
        },
        'the time is returned':function (topic) {
            assert.deepEqual(topic.stdout, __dirname+"\n");
        }
    }
}).export(module);

function setUpExchange(callback) {
    var connection = amqp.createConnection({ url:'amqp://guest:guest@localhost:5672' });
    connection.on('ready', function () {
        callback(connection.exchange('jobs-default', {type:'fanout'}));
    });
}
