var fs = require("fs");

var experimentParams = require("./experimentParameters.js");

var testPath = experimentParams.getPath();

var obj = require(testPath + "analysis/arduino_log.json");

var util = require('util');
var log_file = fs.createWriteStream(testPath + 'analysis/arduino_comms.log', {flags : 'w'});
var log_stdout = process.stdout;

var sentUplinks = {};
var receivedDownlinks = {};

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
//  log_stdout.write(util.format(d) + '\n');
};

myLogger("               Node                                          Server");
myLogger("------------------------------------------------------------------------------------");


var free_channel_violations = 0;
var numberOfSentUplinks = 0;
var numberOfReceivedDownlinks = 0;

for (var i = 0; i < obj.length; i++)
{

    var message = obj[i];
    var messageType = message.message_type;


    if(messageType == "outgoing_uplink")
    {
        var data = message.data;
        var seqNum = message.seq_num;
        var opcode = message.opcode;
        var txStatus = message.tx_status;
        if (txStatus !== "no_channel")
        {
            numberOfSentUplinks++;
            switch (opcode)
            {
                case 0:
                    if (data.length > 0)
                    {
                        myLogger("[REQUEST NEXT FW PACKET][ACK INDEX: " + data + "]");
                    }
                    else
                    {
                        myLogger("[REQUEST NEXT FW PACKET]");
                    }
                    break;
                case 3:
                    myLogger("[SCHEDULED STATUS UPDATE]");
                    break;

            }
            myLogger("[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "]------------------------->" + txStatus);
            myLogger("");
            sentUplinks[seqNum] = message;
        }
    }
    else if(messageType == "incoming_downlink")
    {
        numberOfReceivedDownlinks++;
        var seqNum = message.seq_num;
        var opcode = message.opcode;
        var responseType = message.responseType;
        switch (opcode)
        {
            case "0":
                myLogger("                                                [NEW FW AVAILABLE NOTIFICATION]");
                break;
            case "1":
                var index = message.index_received;
                myLogger("                                                [FW UPDATE PACKET][INDEX: " + index + "]");
                break;
            case "2":
                var index = message.index_received;
                myLogger("                                                [FINAL FW UPDATE PACKET][INDEX: " + index + "]");
                break;

        }
        myLogger("                      <-------------------------[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "]");
        myLogger("");
        receivedDownlinks[seqNum] = message;
    }
}

myLogger("Number of Sent Uplinks: " + numberOfSentUplinks);
myLogger("Number of Received Downlinks: " + numberOfReceivedDownlinks);

fs.writeFileSync(testPath + "analysis/sent_uplinks.json", JSON.stringify(sentUplinks));
fs.writeFileSync(testPath + "analysis/received_downlinks.json", JSON.stringify(receivedDownlinks));