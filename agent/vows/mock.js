var sys = require('sys');
var events = require('events');

function AgentEventEmitter() {
    events.EventEmitter.call(this);
}
sys.inherits(AgentEventEmitter, events.EventEmitter);

function JobProcessor() {
    var this_ = this;
    events.EventEmitter.call(this);
    this.recieve = function (message) {
        this_.emit("message", message);
    }
}
sys.inherits(JobProcessor, events.EventEmitter);

module.exports.AgentEventEmitter = AgentEventEmitter;
module.exports.JobProcessor = JobProcessor;