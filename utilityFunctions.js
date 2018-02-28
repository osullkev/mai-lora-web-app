var orbiwiseConfig = require('./orbiwiseConfig.js');
require('colors');

var applyColour = function(s, colour) {
    switch (colour)
    {
        case 'black':
            return s.black;
        case 'red':
            return s.red;
        case 'green':
            return s.green;
        case 'yellow':
            return s.yellow;
        case 'blue':
            return s.blue;
        case 'magenta':
            return s.magenta;
        case 'cyan':
            return s.cyan;
        case 'white':
            return s.white;
        case 'gray':
            return s.gray;
        case 'grey ':
            return s.grey;
        default:
            return s;
    }

}

var logJSONObject = function (obj, colour){
    for (var x in obj){
        if (typeof obj[x] === 'object'){
            logJSONObject(obj[x], colour);
        }
        else {
            console.log(applyColour(x.toString().toUpperCase() + ": ", colour) + obj[x]);
        }
    }
}
exports.logJSONObject = function(obj, colour){
    logJSONObject(obj, colour);
}


exports.checkCommandLineArgs = function (args){
    var action;
    if (args.length == 3 && args[2] == "stop") {
        action = "stop";
    } else if (args.length < 3) {
        console.log("invalid arguments, usage: ");
        console.log("  - Starting push mode: node server.js port host");
        console.log("  - Starting push mode on public server: node server.js port host");
        console.log("  - Starting push mode on local server: node server.js port host local_test");
        console.log("  - Stopping push mode: node server.js stop");
        process.exit();
    } else {
        action = "start";
    }

    if (args[4] && args[4] == "local_test") {
        local_test = true;
        console.log("Running on local server...")
        orbiwiseConfig.setLocalTest(true);
    }else {
        console.log("Running on public server...")
        orbiwiseConfig.setLocalTest(false);
    }

    return action;
}

exports.padWithZeros = function (str, targetLength) {
    return str.padStart(targetLength, '0');
}

exports.hexToBase64 = function (hex) {
    return new Buffer(hex, 'hex').toString('base64');
}

exports.base64ToHex = function (b64) {
    return new Buffer(b64, 'base64').toString('hex');
}

exports.parseToPacketComponents = function (dataFrame) {
    var opcode = dataFrame.substring(0,1);
    var seq_num = dataFrame.substring(1,5);
    var len = dataFrame.substring(5,8);
    var payload = dataFrame.substring(8);

    return {"header": {"opcode": opcode, "seq_num": seq_num, "len": len},
        "payload": payload};

}