var fs = require("fs")
var _ = require("underscore")._

var vessel = require("./vessel");

module.exports.Config = function (locations) {
    var log = vessel.require("log");
    var this_ = this;
    _(locations).each(function (location) {
        try {
            properties = JSON.parse(fs.readFileSync(location))
            _(properties).each(function (value, key) {
                this_[key] = value
            });
        } catch (error) {
            log("Failed to load config at: " + location + " because of: " + error.message)
        }
    });
}