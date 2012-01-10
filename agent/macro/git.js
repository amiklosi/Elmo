var fs = require("fs");
var exec = require('child_process').exec;

module.exports = function(step, directory, callback) {
    var output = "Git working with " + step.repo + " in directory " + directory;
    output += " Project Name: "+ projectName(step.repo);

    fs.stat(directory+"/"+projectName(step.repo), function(error, stats) {
        if (stats && stats.isDirectory()) {
            var command = "git pull";
            exec(command, {cwd:directory+"/"+projectName(step.repo), env:process.env}, function (error, stdout, stderr) {
                callback(error, command + "\n" + stdout, stderr);
            });
        } else {
            // git clone
        }
    });
}

function projectName(repo) {
    var tokens = repo.split("/");
    var nameWithExtention = tokens[tokens.length - 1];
    return nameWithExtention.substring(0, nameWithExtention.length-4);
}