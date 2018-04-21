var fs = require("fs");
var util = require('util');
var es = require("./experimentalSetup");

var testPath = es.getPath() + "/";

var log_file = fs.createWriteStream(testPath + 'analysis/server_log.json', {flags : 'a'});

tempLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

tempLogger("]");