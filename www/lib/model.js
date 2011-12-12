var mongoose = require("mongoose");
var sys = require("sys");

var jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    steps: [stepSchema]

});

var stepSchema = new mongoose.Schema({
    command: String
});

var runSchema = new mongoose.Schema({
    job:String,
    date:Date,
    complete:Boolean,

    stdout: String,
    stderr: String

});

module.exports.Job = mongoose.model('Job', jobSchema);
module.exports.Run = mongoose.model('Run', runSchema);
module.exports.Step = mongoose.model('Step', stepSchema);


