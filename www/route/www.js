var model = require("../lib/model");
var property = require("../lib/property.js");
var agent = require("../lib/agent");
var agentController = new agent.AgentController();
var _ = require("underscore")._;

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/job', function (req, res) {
        model.Job.find(function (err, jobs) {
            res.render('job/list', {jobs:jobs});
        });
    });

    app.get("/job/new", function (req, res) {
        res.render("job/new", {title:"", description:"", steps:""});
    });

    app.post("/job/new", function (req, res) {
        var job = new model.Job();
        job.title = req.param("title");
        job.description = req.param("description");
        job.steps = JSON.parse(req.param("steps"));
        job.save(function (err, job) {
            res.redirect("/job/" + job._id);
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

    app.post('/job/edit/:id', function (req, res) {
        model.Job.findById(req.param("id"), function (err, job) {
            job.title = req.param("title");
            job.description = req.param("description");
            job.steps = JSON.parse(req.param("steps"));
            job.save();
            res.redirect("/job/" + job.id);
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
            run.state = "pending";
            run.save(function (err) {
                agentController.publish({jobId: run.job, runId:run._id, steps:job.steps});
                res.redirect("/run/" + run._id);
            });
        });
    });

    app.get('/run/:id', function (req, res) {
        var run = model.Run.findById(req.param("id"), function (err, run) {
            var state = run.state;
            if (state == "end") {
                if (_(run.steps).all(function(step) {
                    return step.success;
                })) {
                    state= "success";
                } else {
                    state = "failure"
                };
            }
            res.render("run/show", {run:run, state: state});
        });
    });

    app.dynamicHelpers({
        menu_active:function () {
            return property.create();
        }
    })
}

