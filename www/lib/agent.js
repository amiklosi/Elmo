var amqp = require("amqp");
var model = require("./model");
var vessel = require("../../shared/lib/vessel");

var config = vessel.require("config");

function AgentController() {
    var this_ = this;
    var connection = amqp.createConnection({ url:config["DOTCLOUD_QUEUE_AMQP_URL"]});
    connection.on('ready', function () {
        var runExchange = connection.exchange('run-default', {type:'fanout'});

        var eventExchange = connection.exchange('event-default', {type:'fanout'});
        var q = connection.queue('meh', function () {
            q.bind(eventExchange, "*");
            q.subscribe(function (json, headers, deliveryInfo) {
                console.log("json ", json);
                model.Run.findById(json.runId, function (err, run) {
                    console.log("run ", run);
                    if (json.event == "step") {
                        run.stdout = json.stdout;
                        run.stderr = json.stderr;
                    } else {
                        run.complete = true;
                    }
                    run.save();
                });

            });
        });

        this_.publish = function (job) {
            runExchange.publish('test.message', job);
        }
        this_.end = function () {
            connection.end();
        }

    });

}
module.exports.AgentController = AgentController;