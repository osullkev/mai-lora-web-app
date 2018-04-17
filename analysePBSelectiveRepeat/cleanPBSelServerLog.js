var fs = require('fs');
var util = require('util');

var testPath = "../piggybacked-selective-repeat-logs/sf7/1000b/logs_2018-4-16__9-41-24/";


var log_file = fs.createWriteStream(testPath + 'analysis/server_log.json', {flags : 'w'});

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream("../piggybacked-selective-repeat-logs/sf7/1000b/logs_2018-4-16__9-41-24/nodeCommsLogfile_2018-4-16__9-41-24.log")
});

myLogger("[{\"server\": \"no_response_scheduled\"}");
lineReader.on('line', function (line) {
    var obj = JSON.parse(line);
    if(obj.assembled_packet && obj.assembled_packet.length == 4)
    {
        myLogger("]")
    }
    else
    {
        myLogger("," + line);
    }
});
