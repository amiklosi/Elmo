var mongoose = require("mongoose");
var sys = require("sys");

var jobSchema = new mongoose.Schema({
    title: String,
    description: String,
    steps: [stepSchema]

});

var stepSchema = new mongoose.Schema({
    type: String,
    body: String
});

var runSchema = new mongoose.Schema({
    job:String,
    date:Date,
    state: String,
    steps: [stepResultSchema]
});

var stepResultSchema = new mongoose.Schema({
    stdout: String,
    stderr: String,
    success: Boolean
})

module.exports.Job = mongoose.model('Job', jobSchema);
module.exports.Run = mongoose.model('Run', runSchema);
module.exports.Step = mongoose.model('Step', stepSchema);
module.exports.StepResult = mongoose.model('StepResult', stepResultSchema);


