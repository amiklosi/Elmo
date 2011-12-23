var express = require("express");
var mongoose = require("mongoose");
var config = require("../shared/lib/config") ;

var vessel = require("../shared/lib/vessel");
process.vessel = vessel;
vessel.put("config", function() {
    return new config.Config(["./www/config.json", "/home/dotcloud/environment.json"])
});
vessel.put("agent", function() {
    return require("./lib/agent")
});

var app = express.createServer();

mongoose.connect(process.vessel.dependsOn("config")["DOTCLOUD_DATA_MONGODB_URL"]+"/elmo");

var agent =

    process.vessel = vessel;

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

app.listen(8080);
console.log("Server running at http://127.0.0.1:8080/");