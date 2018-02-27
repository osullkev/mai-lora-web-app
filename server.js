/*jslint node: true, sloppy: true, bitwise: true, vars: true, eqeq: true, plusplus: true, nomen: true, es5:true */
/* Pervasive Nation */
/* 01 Feb 2018 */

var args = process.argv;

var debug = false;
var local_test = false;
var action = null;

if (args.length == 3 && args[2] == "stop") {
    action = "stop";
} else if (args.length < 4) {
    console.log("invalid arguments, usage: ");
    console.log("  - Starting push mode: node server.js port host");
    console.log("  - Starting push mode with debug log: node server.js port host debug_log");
    console.log("  - Stopping push mode: node server.js stop");
    process.exit();
} else {
    action = "start";
}

var appSrvrPort = parseInt(args[2], 10);
var appSrvrHost = args[3];

if (args[4] && args[4] == "debug_log") {
    debug = true;
}

if (args[5] && args[5] == "local_test") {
    local_test = true;
}


/* 
   PACKAGES DECLARATION
   To install packages, run npm install, e.g.
     npm install http
     npm install express
     npm install basic-auth
     npm install url
*/

var http = require('http');
var express = require('express');
var orbiwiseConfig = require('./orbiwise-config.js');
var putHandler = require('./putHandler.js');
var postHandler = require('./postHandler.js');
require('colors');

if (!local_test){
    console.log("Running on public server...")
    orbiwiseConfig.setLocalTest(false);
}
else{
    console.log("Running on local server...")
    orbiwiseConfig.setLocalTest(true);
}

// allow to do HTTPS to self signed servers.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//   PUSH REGISTER / UNREGISTER functions
if (action == "stop") {
    orbiwiseConfig.stopPush();

} else {

    var appServer = express();
    var httpServer = http.createServer(appServer).listen(appSrvrPort, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;
        console.log('Starting server listening on port ' + port);
        // Registration for PUSH
        orbiwiseConfig.startPush(null, appSrvrHost, appSrvrPort);
    });

    // PUT management from DASS
    appServer.put('/*', putHandler.handlePut);

    // POST managament from DASS 
    appServer.post('/*', postHandler.handlePost);
}
