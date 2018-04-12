var fs = require('fs');
var util = require('util');

var experimentParams = require("./experimentParameters.js");

var testPath = experimentParams.getPath();

var log_file = fs.createWriteStream(testPath + 'analysis/arduino_log.json', {flags : 'w'});
var log_stdout = process.stdout;

var finalPacket = false;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
 // log_stdout.write(util.format(d) + '\n');
};

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(testPath + experimentParams.getArduinoFile())
});

myLogger("[");
lineReader.on('line', function (line) {
    var s = line.substring(0,6);
    switch(s)
    {
        case "------":
            break;
        case "[STATE":
            break;
        case "TX: [P":
            myLogger("{");

            var port = line.charAt(10);
            var opcode = line.charAt(20);
            var seqNum = line.substring(30,33).toUpperCase();
            var data = line.substring(40, line.length - 1);
            myLogger("\"port\":" + port + ",\"message_type\":" + "\"outgoing_uplink\"" + ",\"opcode\": " + opcode + ",\"seq_num\": " + "\"" + seqNum + "\"" + ",\"data\": \"" + data +"\"");
            break;
        case "RX: [P":
            var port = line.charAt(10);
            var opcode = line.charAt(20);
            var seqNum = line.substring(30,33).toUpperCase();
            myLogger(",\"tx_status\": " + "\"response_received\"");
            myLogger("},")
            myLogger("{");
            myLogger("\"port\":" + "\"" + port + "\"");
            myLogger(",\"message_type\":" + "\"incoming_downlink\"");
            myLogger(",\"opcode\":" + "\"" + opcode + "\"");
            myLogger(",\"seq_num\":" + "\"" + seqNum + "\"");
            switch (opcode)
            {
                case "0":
                    myLogger(",\"response_type\": " + "\"update_available\"},");
                    break;
                case "1":
                    myLogger(",\",response_type\": " + "\"update_packet\"");
                    break;
                case "2":
                    myLogger(",\"response_type\": " + "\"final_update_packet\"");
                    finalPacket = true;
                    break;
                case "3":
                    myLogger(",\"response_type\": " + "\"execute_firmware\"}]");
                    break;
            }
            break;
        case "PROCES":
            var index = line.substring(29, 31);
            if (index.charAt(1) == "]") index = index.charAt(0);
            var index_hex = parseInt(index).toString(16);
            // myLogger(",\"index_received\": " + "\"" + index_hex + "\"},");
            if (finalPacket == true)
            {
                myLogger(",\"index_received\": " + "\"" + index_hex + "\"}]");

            }
            else
            {
                myLogger(",\"index_received\": " + "\"" + index_hex + "\"},");
            }

            break;
        case "No Cha":
            var attempt = line.substring(23,25);
            if (attempt.charAt(1) == ";") attempt = attempt.charAt(0);
            myLogger(",\"tx_status\":"+ "\"no_channel\"" + ",\"channel_attempts\": " + attempt + "},");
            break;
        case "Succes":
            if (line.charAt(11) == "u") myLogger(",\"tx_status\": " + "\"no_response\"},");
            break;
        case "MAC_ER":
            myLogger(",\"tx_status\": " + "\"mac_err\"},");
            break;
        case "EXECUT":

    }
});