var fs = require("fs");
var util = require('util');
var es = require("./experimentalSetup");

var testPath = es.getPath() + "/";

var arduino_obj = require(testPath + "analysis/arduino_log.json");

var testResultsLogFile = fs.createWriteStream(testPath + 'analysis/results.log', {flags : 'w'});
var log_stdout = process.stdout;
var log_file_CSV = fs.createWriteStream('results.log', {flags : 'a'});


testResultsLogger = function(d) { //
    testResultsLogFile.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

CSVLogger = function(d) { //
    log_file_CSV.write(util.format(d) + '\n');
};

var sentUplinks = {};
var receivedDownlinks = {};
var receivedDownlinksCount = 0;

/*******************************
 ///////////////////////////////
 // PARSE THE ARDUINO LOGS
 ///////////////////////////////
********************************/

for (var i = 0; i < arduino_obj.length; i++)
{
    var message = arduino_obj[i];
    var messageType = message.message_type;

    if(messageType == "outgoing_uplink")
    {
        var data = message.data;
        var ulseqNum = message.ul_seq;
        var opcode = message.opcode;
        var txStatus = message.tx_status;
        if (txStatus !== "channel_violation")
        {
            sentUplinks[ulseqNum.toUpperCase()] = message;
        }
    }
    else if (messageType == "incoming_downlink")
    {
        receivedDownlinksCount++;
        var dlseqNum = message.dl_seq;
        receivedDownlinks[dlseqNum.toUpperCase()] = message;
    }
}

var numberOfUplinks = 0;
var effectiveUplink = 0;
var ineffectiveResponseUplink = 0;
var corruptedDownlinks = 0;

console.log(sentUplinks);

for (var k in sentUplinks)
{
    numberOfUplinks++;
    var ul = sentUplinks[k];
    if (ul.tx_response == "successful_with_response")
    {
        effectiveUplink++;
    }
    else
    {
        ineffectiveResponseUplink++;
        if (ul.tx_response == "mac_err")
        {
            corruptedDownlinks++;
        }
    }
}


/*******************************
 ///////////////////////////////
 // PARSE THE SERVER LOGS
 ///////////////////////////////
 ********************************/

var server_obj = require(testPath + "analysis/server_log.json");

server_obj.splice(-1,1); // Remove last element as it was never sent.

var j = 0;
var refactored_server_obj = [];
var receivedUplinksCount = 0;
var receivedUplinks = {};
var sentDownlinks = {};
var sentDownlinksCount = 0;

while (j < server_obj.length)
{
    if (j+1 < server_obj.length) refactored_server_obj.push(JSON.stringify(server_obj[j+1]));
    refactored_server_obj.push(JSON.stringify(server_obj[j]));
    j = j+2;
}

for (var m = 0; m < refactored_server_obj.length; m++)
{
    var server_message = JSON.parse(refactored_server_obj[m]);
    var serverMessageType = server_message.message;
    if(serverMessageType && serverMessageType == "INCOMING UPLINK")
    {
        receivedUplinksCount++;
        var ulseqNum = server_message.header.seq_num;
        receivedUplinks[ulseqNum.toUpperCase()] = server_message;
    }
    else if (serverMessageType && serverMessageType == "OUTGOING DOWNLINK")
    {
        var dlseqNum = server_message.seq_num;
        sentDownlinksCount++;
        sentDownlinks[dlseqNum.toUpperCase()] = message;
    }
}

/*******************************
 ///////////////////////////////
 // DETERMINE LOST UPLINKS
 ///////////////////////////////
 ********************************/
var lostUplinksCount = 0;
var lostUplinks = {};

for (var n in sentUplinks)
{
    if (!receivedUplinks[n])
    {
        lostUplinksCount++;
        lostUplinks[n] = sentUplinks[n];
    }
}

/*******************************
 ///////////////////////////////
 // DETERMINE LOST/CORRUPTED/WASTED DOWNLINKS
 ///////////////////////////////
 ********************************/
var wastedDownlinksCount = 0;
var wastedDownlinks = {};

for (var o in sentDownlinks)
{
    var oCaps = o.toUpperCase();
    if (!receivedDownlinks[oCaps])
    {
        wastedDownlinksCount++;
        wastedDownlinks[oCaps] = receivedDownlinks[oCaps];
    }
}



testResultsLogger("---------------------------------------------")
testResultsLogger("Total Number of Sent Uplinks: " + numberOfUplinks);
testResultsLogger("Total Number of Received Uplinks: " + receivedUplinksCount);
testResultsLogger("Diff: " + (numberOfUplinks - receivedUplinksCount));
testResultsLogger("---------------------------------------------")
testResultsLogger("Total Number of Sent Downlinks: " + sentDownlinksCount);
testResultsLogger("Total Number of Received Downlinks: " + receivedDownlinksCount);
testResultsLogger("Diff: " + (sentDownlinksCount - receivedDownlinksCount));
testResultsLogger("---------------------------------------------");
var inherentIneffectiveDataUplinks = 1;
var inherentIneffectiveResponseUplinks = 1;
effectiveUplink = effectiveUplink - inherentIneffectiveDataUplinks;
var ineffectiveUplink = ineffectiveResponseUplink + inherentIneffectiveDataUplinks;
testResultsLogger("Effective Uplinks: " + effectiveUplink);
testResultsLogger("Ineffective Uplinks: " + ineffectiveUplink);
testResultsLogger("|");
testResultsLogger("+--- Ineffective Data Uplinks: " + inherentIneffectiveDataUplinks);
testResultsLogger("+--+ Ineffective Response Uplinks: " + ineffectiveResponseUplink);
testResultsLogger("   |");
testResultsLogger("   +--- Lost Uplinks: " + lostUplinksCount);
testResultsLogger("   +--- No Scheduled Downlinks: " + inherentIneffectiveResponseUplinks);
testResultsLogger("   +--- Lost/Duty-Cycle-Restricted Downlinks: " + (wastedDownlinksCount - corruptedDownlinks));
testResultsLogger("   +--- Mac Error: " + corruptedDownlinks);
testResultsLogger("---------------------------------------------")


var s = new Date(JSON.parse(refactored_server_obj[0]).timestamp);
var f = new Date(JSON.parse(refactored_server_obj[refactored_server_obj.length - 1]).timestamp);
var delta = Math.abs(f - s) / 1000;
// calculate (and subtract) whole days
var days = Math.floor(delta / 86400);
delta -= days * 86400;
// calculate (and subtract) whole hours
var hours = Math.floor(delta / 3600) % 24;
delta -= hours * 3600;
// calculate (and subtract) whole minutes
var minutes = Math.floor(delta / 60) % 60;
delta -= minutes * 60;
// what's left is seconds
var seconds = delta % 60;  // in theory the modulus is not required
testResultsLogger("Total Time:");
testResultsLogger("\tHours:" + hours);
testResultsLogger("\tMinutes:" + minutes);
testResultsLogger("\tSeconds:" + Math.round(seconds));
testResultsLogger("\tTotal Seconds:" + Math.round(Math.abs(f - s) / 1000));

/*******************************
 ///////////////////////////////
 // Log to CSV Files
 ///////////////////////////////
 ********************************/

var sf = es.getSF();
var update = es.getUpdate()
CSVLogger(
    sf + "," +
    update.substring(0, update.length-1) + "," +
    Math.round(Math.abs(f - s) / 1000) + "," +
    numberOfUplinks + "," +
    receivedUplinksCount + "," +
    sentDownlinksCount + "," +
    receivedDownlinksCount + "," +
    effectiveUplink + "," +
    ineffectiveUplink + "," +
    inherentIneffectiveDataUplinks + "," +
    ineffectiveResponseUplink + "," +
    lostUplinksCount + "," +
    inherentIneffectiveResponseUplinks + "," +
    (wastedDownlinksCount - corruptedDownlinks) + "," +
    corruptedDownlinks);

// for (var i = 0; i < obj.length; i++)
// {
//
//     var message = obj[i];
//     var messageType = message.message_type;
//
//
//
//
//     if(messageType == "outgoing_uplink")
//     {
//         var data = message.data;
//         var seqNum = message.seq_num;
//         var opcode = message.opcode;
//         var txStatus = message.tx_status;
//         if (txStatus !== "no_channel")
//         {
//             numberOfSentUplinks++;
//             switch (opcode)
//             {
//                 case 0:
//                     if (data.length > 0)
//                     {
//                         myLogger("[REQUEST NEXT FW PACKET][ACK INDEX: " + data + "]");
//                     }
//                     else
//                     {
//                         myLogger("[REQUEST NEXT FW PACKET]");
//                     }
//                     break;
//                 case 3:
//                     myLogger("[SCHEDULED STATUS UPDATE]");
//                     break;
//
//             }
//             myLogger("[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "]------------------------->" + txStatus);
//             myLogger("");
//             sentUplinks[seqNum] = message;
//         }
//     }
//     else if(messageType == "incoming_downlink")
//     {
//         numberOfReceivedDownlinks++;
//         var seqNum = message.seq_num;
//         var opcode = message.opcode;
//         var responseType = message.responseType;
//         switch (opcode)
//         {
//             case "0":
//                 myLogger("                                                [NEW FW AVAILABLE NOTIFICATION]");
//                 break;
//             case "1":
//                 var index = message.index_received;
//                 myLogger("                                                [FW UPDATE PACKET][INDEX: " + index + "]");
//                 break;
//             case "2":
//                 var index = message.index_received;
//                 myLogger("                                                [FINAL FW UPDATE PACKET][INDEX: " + index + "]");
//                 break;
//
//         }
//         myLogger("                      <-------------------------[OPCODE:" + opcode + "][SEQNUM:" + seqNum + "]");
//         myLogger("");
//         receivedDownlinks[seqNum] = message;
//     }
// }

// myLogger("Number of Sent Uplinks: " + numberOfSentUplinks);
// myLogger("Number of Received Downlinks: " + numberOfReceivedDownlinks);
//
// fs.writeFileSync(testPath + "analysis/sent_uplinks.json", JSON.stringify(sentUplinks));
// fs.writeFileSync(testPath + "analysis/received_downlinks.json", JSON.stringify(receivedDownlinks));