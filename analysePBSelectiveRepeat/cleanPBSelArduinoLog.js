var fs = require('fs');
var util = require('util');
var es = require("./experimentalSetup");

var testPath = es.getPath() + "/";
try
{
    fs.mkdirSync(testPath + "analysis");
}
catch (err)
{
    // throw err;
    console.log("Note: analysis could already exist");
}

var log_file = fs.createWriteStream(testPath + 'analysis/arduino_log.json', {flags : 'w'});
var log_stdout = process.stdout;

var finalPacket = false;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(testPath + "arduinoSerialLogfile_" + es.getDate() + ".log")
});

myLogger("[");
lineReader.on('line', function (line) {
    var curlyBracketCheck = line.charAt(0);
    if (curlyBracketCheck == "{")
    {
        var obj = JSON.parse(line);
        if (obj.opcode == "0")
            myLogger(line + ",");
        else
            myLogger(line + "]");
    }
});
