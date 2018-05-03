var fs = require('fs');
var util = require('util');
var es = require("./experimentalSetup");

var testPath = es.getPath() + "/";

var log_file = fs.createWriteStream('./debug.log', {flags : 'w'});
var log_stdout = process.stdout;

var finalPacket = false;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf7/2000b/logs_2018-4-25__9-27-29/arduinoSerialLogfile_2018-4-25__9-27-29.log')
});

lineReader.on('line', function (line) {
    var curlyBracketCheck = line.charAt(0);
    if (curlyBracketCheck == "{")
    {
        var obj = JSON.parse(line);
        if (obj.message_type == "outgoing_uplink")
        {
            if (obj.tx_response !== "channel_violation")
            {
                myLogger("UPLINK: " + JSON.stringify(obj));
                if (obj.tx_response == "successful_no_response")
                {
                    myLogger("MISSING DOWNLINK - REASON UNKNOWN");
                    myLogger("");
                    myLogger("");
                }
                else if (obj.tx_response == "mac_err")
                {
                    myLogger("MISSING DOWNLINK - MAC ERR (POTENTIALLY RECEIVED A CORRUPTED DOWNLINK)");
                    myLogger("");
                    myLogger("");
                }
            }
        }
        else if (obj.message_type == "incoming_downlink")
        {
            myLogger("RECEIVED DOWNLINK: " + JSON.stringify(obj));
            myLogger("");
            myLogger("");

        }

    }
});
