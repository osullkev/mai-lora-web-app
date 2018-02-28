var orbiwiseConfig = require('./orbiwise-config.js');
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
            logJSONObject(obj[x]);
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