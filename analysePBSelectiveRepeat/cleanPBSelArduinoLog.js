var fs = require('fs');
var util = require('util');

var testPath = "../piggybacked-selective-repeat-logs/sf7/1000b/logs_2018-4-16__9-41-24/";

var log_file = fs.createWriteStream(testPath + 'analysis/arduino_log.json', {flags : 'w'});
var log_stdout = process.stdout;

var finalPacket = false;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream("../piggybacked-selective-repeat-logs/sf7/1000b/logs_2018-4-16__9-41-24/arduinoSerialLogfile_2018-4-16__9-41-24.log")
});

myLogger("[");
lineReader.on('line', function (line) {
    var obj = JSON.parse(line);
    if (obj.opcode == "0")
        myLogger(line + ",");
    else
        myLogger(line + "]");
});
