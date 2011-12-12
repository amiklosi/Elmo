var express = require("express");
var mongoose = require("mongoose");
var config = require("../shared/lib/config");


var app = express.createServer();
mongoose.connect("mongodb://localhost/elmo");

var config = new config.Config(["config.json", "/home/dotcloud/environment.json"])

app.set("views", __dirname + "/view")
app.set("view engine", "jade")

app.configure(function () {
    app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
    app.use(express.cookieParser());
    app.use(express.session({secret:'session-id'}));
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

require("./route/www")(app);

var model = require("./lib/model");
var job = new model.Job();
job.title = "Sample Job";
job.description = "A Sample Job";
job.steps.push({command: "date"});
job.save();

app.listen(8080);
console.log("Server running at http://127.0.0.1:8080/");