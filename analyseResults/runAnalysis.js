var experimentParams = require("./experimentParameters.js");

var testPath = experimentParams.getPath();


var sentUplinks = require(testPath + "analysis/" + "sent_uplinks.json");
var sentDownlinks = require(testPath + "analysis/" + "sent_downlinks.json");
var receivedUplinks = require(testPath + "analysis/" + "received_uplinks.json");
var receivedDownlinks = require(testPath + "analysis/" + "received_downlinks.json");


var fs = require("fs");
var util = require('util');
var log_file = fs.createWriteStream(testPath + 'analysis/results.log', {flags : 'w'});
var log_file_CSV = fs.createWriteStream('results.log', {flags : 'a'});
var log_stdout = process.stdout;


myLogger = function(d) { //
    log_file.write(util.format(d) + '\n');
//  log_stdout.write(util.format(d) + '\n');
};

myLoggerCSV = function(d) { //
    log_file_CSV.write(util.format(d) + '\n');
//  log_stdout.write(util.format(d) + '\n');
};

var numberOfUplinks = 0;
var numberOfReceivedUplinks = 0;
var numberOfLostUplinks = 0;

// myLogger("------------------")
// myLogger("Uplinks")
// myLogger("------------------")
for (var key in sentUplinks)
{
    numberOfUplinks++;
    if (receivedUplinks[key])
    {
        // myLogger(key + ": received");
        numberOfReceivedUplinks++;
    }
    else
    {
        // myLogger(key + ": lost");
        numberOfLostUplinks++;
    }
}

var numberOfReceivedDownlinks = 0;
var numberOfWastedDownlinks = 0;
var numberOfDownlinks = 0;
// myLogger("------------------")
// myLogger("Downlinks")
// myLogger("------------------")
for (var b in sentDownlinks)
{
    numberOfDownlinks++;
    // console.log(b);

    if (receivedDownlinks[b])
    {
        numberOfReceivedDownlinks++;
        // myLogger(b + ": received");
    }
    else
    {
        numberOfWastedDownlinks++;
        // myLogger(b + ": lost / wasted");
    }
}

// myLogger("------------------")
// myLogger("Results")
// myLogger("------------------")
// myLogger("No. Of Received Uplinks: " + numberOfReceivedUplinks + "/" +
//     numberOfUplinks + " (" + Math.round((numberOfReceivedUplinks*100)/numberOfUplinks) + "%)");
// myLogger("No. Of Lost Uplinks: " + numberOfLostUplinks + "/" +
//     numberOfUplinks + " (" + Math.round((numberOfLostUplinks*100)/numberOfUplinks) + "%)");
// myLogger("------------------")
// myLogger("No. Of Received Downlinks: " + numberOfReceivedDownlinks + "/" +
//     numberOfDownlinks + " (" + Math.round((numberOfReceivedDownlinks*100)/numberOfDownlinks) + "%)");
// myLogger("No. Of Wasted Downlinks: " + numberOfWastedDownlinks + "/" +
//     numberOfDownlinks + " (" + Math.round((numberOfWastedDownlinks*100)/numberOfDownlinks) + "%)");

var obj = require(testPath + "analysis/server_log.json");
obj.shift();
var s = new Date(obj[0].timestamp);
var f = new Date(obj[obj.length - 1].timestamp);
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
myLogger("------------------")
myLogger("Total Time:");
myLogger("\tHours:" + hours + "\tMinutes:" + minutes + "\tSeconds:" + Math.round(seconds))
myLogger("\t(seconds)->\t" + Math.round(Math.abs(f - s) / 1000));

var productiveUplinks = 0;
var unproductiveUplinks = 0;
var uplinkCount = 0;

for (var k in sentUplinks)
{

    uplinkCount++;
    if (sentUplinks[k].tx_status == "response_received")
    {
        // myLogger(k + ": productive (" + sentUplinks[k].tx_status + ")");
        productiveUplinks++;
    }
    else
    {
        // myLogger(k + ": wasted (" + sentUplinks[k].tx_status + ")");
        unproductiveUplinks++;
    }
}


// Classify the duplicated downlinks as unproductive
// The second fw update available notification
// The duplicated last firmware update index
var protocolUnproductiveUplinks = 2
productiveUplinks = productiveUplinks - protocolUnproductiveUplinks;
unproductiveUplinks = unproductiveUplinks + protocolUnproductiveUplinks;
//

myLogger("Number of Productive Uplinks: " + productiveUplinks + "/" + uplinkCount +
" (" + Math.round((productiveUplinks*100)/uplinkCount) + "%)");
myLogger("Number of Unproductive Uplinks: " + unproductiveUplinks + "/" + uplinkCount +
" (" + Math.round((unproductiveUplinks*100)/uplinkCount) + "%)");
myLogger("\tDue to Protocol Design: 2" + "/" + uplinkCount +
    " (" + Math.round((2*100)/uplinkCount) + "%)");
myLogger("\tDue to Lost Uplinks: " + numberOfLostUplinks + "/" + uplinkCount +
    " (" + Math.round((numberOfLostUplinks*100)/uplinkCount) + "%)")
myLogger("\tDue to Lost Downlinks/Gateway Duty Cycle:" + (unproductiveUplinks - numberOfLostUplinks - 2) + "/" + uplinkCount +
    " (" + Math.round(((unproductiveUplinks - numberOfLostUplinks - 2)*100)/uplinkCount) + "%)");

var sf = experimentParams.getSF();
var update = experimentParams.getUpdate()
myLoggerCSV(sf.substring(0, sf.length-1) + "," +
            update.substring(0, update.length-1) + "," +
            Math.round(Math.abs(f - s) / 1000) + "," +
            uplinkCount + "," +
            productiveUplinks + "," +
            Math.round((productiveUplinks*100)/uplinkCount) + "," +
            unproductiveUplinks + "," +
            Math.round((unproductiveUplinks*100)/uplinkCount) + "," +
            protocolUnproductiveUplinks + "," +
            Math.round((protocolUnproductiveUplinks*100)/uplinkCount) + "," +
            numberOfLostUplinks + "," +
            Math.round((numberOfLostUplinks*100)/uplinkCount) + "," +
            (unproductiveUplinks - numberOfLostUplinks - protocolUnproductiveUplinks) + "," +
            Math.round(((unproductiveUplinks - numberOfLostUplinks - protocolUnproductiveUplinks)*100)/uplinkCount)
);
