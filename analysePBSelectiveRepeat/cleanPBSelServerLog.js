var fs = require('fs');
var util = require('util');
var es = require("./experimentalSetup");

var testPath = es.getPath() + "/";

var log_file = fs.createWriteStream(testPath + 'analysis/server_log.json', {flags : 'w'});

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(testPath + "nodeCommsLogfile_" + es.getDate() + ".log")
});

myLogger("[{\"server\": \"no_response_scheduled\"}");
lineReader.on('line', function (line) {
    var curlyBracketCheck = line.charAt(0);
    if (curlyBracketCheck == "{")
    {

        var obj = JSON.parse(line);
        myLogger("," + line);
    }
    else
    {
        console.log("]");
    }
});
