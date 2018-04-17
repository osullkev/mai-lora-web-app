var fs = require("fs");

var experimentParams = require("./experimentParameters.js");

var testPath = experimentParams.getPath();

var obj = require(testPath + "analysis/server_log.json");

var util = require('util');
var log_file = fs.createWriteStream(testPath + "analysis/server_comms.log", {flags : 'w'});
var log_stdout = process.stdout;

myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
//  log_stdout.write(util.format(d) + '\n');
};

var i = 1;
var c = [];
obj.shift();
c.push(JSON.stringify(obj[0]));

while (i < obj.length)
{
    if (i+1 < obj.length) c.push(JSON.stringify(obj[i+1]));
    c.push(JSON.stringify(obj[i]));
    i = i+2;
}

var receivedUplinks = {};
var sentDownlinks = {};

myLogger("               Node                                          Server");
myLogger("------------------------------------------------------------------------------------");

var numberOfReceivedUplinks = 0;
var numberOfSentDownlinks = 0;



for (var i = 0; i < obj.length; i++)
{
    var message = JSON.parse(c[i]);
    var messageType = message.message;
    if(messageType == "INCOMING UPLINK")
    {
        numberOfReceivedUplinks++;
        var opcode = message.header.opcode;
        var seqNum = message.header.seq_num;
        var timestamp = message.timestamp.substring(11, 19);
        var data = message.payload;

        switch (opcode)
        {
            case "0":
                if (data.length > 0)
                {
                    myLogger("[REQUEST NEXT FW PACKET][ACK INDEX: " + data + "]");
                }
                else
                {
                    myLogger("[REQUEST NEXT FW PACKET]");
                }
                break;
            case "3":
                myLogger("[SCHEDULED STATUS UPDATE]");
                break;

        }

        myLogger("[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "][TIME:" + timestamp + "]--------->");
        receivedUplinks[seqNum.toUpperCase()] = message;

    }
    else if(messageType == "OUTGOING DOWNLINK")
    {
        numberOfSentDownlinks++;
        var opcode = message.opcode;
        var seqNum = message.seq_num;
        var timestamp = message.timestamp.substring(11, 19);
        var data = message.data;
        switch (opcode)
        {
            case "0":
                var index = data.substring(0,2).toUpperCase;
                myLogger("                                                [NEW FW AVAILABLE NOTIFICATION]");
                break;
            case "1":
                var index = data.substring(0,2);
                myLogger("                                                [FW UPDATE PACKET][INDEX: " + index + "]");
                break;
            case "2":
                var index = data.substring(0,2);
                myLogger("                                                [FINAL FW UPDATE PACKET][INDEX: " + index + "]");
                break;

        }
        myLogger("                                      <---------[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "][TIME:" + timestamp + "]");
        sentDownlinks[seqNum.toUpperCase()] = message;
    }
    else{
        // myLogger("Unrecognised message type");
    }
    myLogger("");
}

myLogger("Number of Received Uplinks: " + numberOfReceivedUplinks);
myLogger("Number of Sent Downlinks: " + numberOfReceivedUplinks);

fs.writeFileSync(testPath + "analysis/received_uplinks.json", JSON.stringify(receivedUplinks));
fs.writeFileSync(testPath + "analysis/sent_downlinks.json", JSON.stringify(sentDownlinks));

