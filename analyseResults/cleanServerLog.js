var fs = require('fs');
var util = require('util');

var experimentParams = require("./experimentParameters.js");

var testPath = experimentParams.getPath();

var log_file = fs.createWriteStream(testPath + 'analysis/server_log.json', {flags : 'w'});
var log_stdout = process.stdout;

var finalPacket = false;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
 // log_stdout.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(testPath + experimentParams.getServerFile())
});

myLogger("[{}");
lineReader.on('line', function (line) {
    var obj = JSON.parse(line);
    if(obj.opcode == "3")
    {
        myLogger("]")
    }
    else
    {
        myLogger("," + line);
    }
});
