var sys = require('sys');
var events = require('events');

function AgentEventEmitter() {
    events.EventEmitter.call(this);
}
sys.inherits(AgentEventEmitter, events.EventEmitter);

function AgentEventProcessor() {
    var this_ = this;
    events.EventEmitter.call(this);
    this.recieve = function (message) {
        this_.emit("message", message);
    }
}
sys.inherits(AgentEventProcessor, events.EventEmitter);

module.exports.AgentEventEmitter = AgentEventEmitter;
module.exports.AgentEventProcessor = AgentEventProcessor;