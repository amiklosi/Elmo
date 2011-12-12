var model = require("../lib/model");
var agent = require("../lib/agent");
var property = require("../lib/property.js");
var agentController = new agent.AgentController();

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/job', function (req, res) {
        model.Job.find(function (err, jobs) {
            res.render('job/list', {jobs:jobs});
        });
    });

    app.get('/job/:id', function (req, res) {
        model.Job.findById(req.param("id"), function (err, job) {
            var runs = model.Run.find({ 'job':job._id }, function (err, runs) {
                res.render("job/show", {job:job, runs:runs})
            });
        });
    });

    app.get('/job/edit/:id', function (req, res) {
        model.Job.findById(req.param("id"), function (err, job) {
            res.render("job/edit", {job:job})
        });
    });

    app.post('/job/delete', function (req, res) {
        model.Job.findById(req.param("id"), function (err, job) {
            job.remove();
            res.redirect("/job");
        });
    })

    app.post('/job/run', function (req, res) {
        var job = model.Job.findById(req.param("id"), function (err, job) {
            var run = new model.Run();
            run.job = job._id;
            run.date = new Date();
            run.save(function (err) {
                agentController.publish({runId:run._id, steps:job.steps});
                res.redirect("/run/" + run._id);
            });
        });
    });

    app.get('/run/:id', function (req, res) {
        var run = model.Run.findById(req.param("id"), function (err, run) {
            res.render("run/show", {run:run});
        });
    });

    app.dynamicHelpers({
        menu_active:function () {
            return property.create();
        }
    })
}

