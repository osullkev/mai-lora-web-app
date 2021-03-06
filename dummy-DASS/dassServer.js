/*jslint node: true, sloppy: true, bitwise: true, vars: true, eqeq: true, plusplus: true, nomen: true, es5:true */
/* Pervasive Nation */
/* 01 Feb 2018 */
var args = process.argv;

var action = null;

if (args.length == 3 && args[2] == "stop") {
    action = "stop";
} else if (args.length < 3) {
    console.log("invalid arguments, usage: ");
    console.log("  - Starting push mode: node server.js port host");
    console.log("  - Stopping push mode: node server.js stop");
    process.exit();
} else {
    action = "start";
}

var appSrvrPort = parseInt(args[2], 10);
var appSrvrHost = args[3];

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
var u = require('url');
var prompt = require('prompt');
var httpRequest = require('request');
var utils = require('../utilityFunctions.js');
require('colors');

var log = function (o) {
    if (true) {
        console.log(o);
    }
};

// allow to do HTTPS to self signed servers.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Application server declaration, using express.js
var appServer = express();
var httpServer = http.createServer(appServer).listen(appSrvrPort, function () {
    var host = httpServer.address().address;
    var port = httpServer.address().port;
    console.log('Starting server listening on port ' + port);
});

// POST managament from DASS
appServer.post('/*', function (req, res) {

    console.log("-------------------------------------------------------------".magenta);
    console.log("RECEIVING HTTP POST".magenta);
    console.log("URL:  ".magenta + req.url);
    
    req.setEncoding('utf8');

    var payload = '';
    req.on('data', function (chunk) {
        payload += chunk;
    });


    // When the message body is available we can do the query.
    req.on('end', function () {
        responseCode = 202;
        responseMessage = {"id": 555};
        try {
            console.log("DATA (base64): ".magenta + payload);
            var payloadHex = utils.base64ToHex(payload)
            console.log("DATA (hex): ".magenta + payloadHex);
            var packetJSON = utils.parseToPacketComponents(payloadHex);
            console.log("UPLINK PACKET: ".blue);
            utils.logJSONObject(packetJSON, 'green');
            res.status(responseCode).json(responseMessage); // Returning empty body & 202 in order to keep payloads on the DASS
        } catch (ex) {
            log("error in payload");
            log(payload);
            res.status(404).json(responseMessage); // Returning empty body & 202 in order to keep payloads on the DASS   
        }
        console.log("RESPONSE TO HTTP POST".yellow);
        console.log("CODE:             ".yellow + responseCode);
        console.log("RESPONSE MESSAGE: ".yellow + JSON.stringify(responseMessage));
    });

});


function commandInput() {
    console.log("-------------------------------------------------------------".green);
    console.log("Enter command... [0-exit, Else-post data]".green)
    prompt.start();
    prompt.get(['f'], function (err, result) {
        switch (result.f) {
            case '0':
                process.exit();
                break;
            default:
                message = utils.hexToBase64(result.f);
                host = 'http://localhost:3030/';
                id = 1;
                console.log("-------------------------------------------------------------".blue);
                console.log("SENDING HTTP POST".blue);
                console.log("HOST:    ".blue + host);
                console.log("ID:      ".blue + id);
                console.log("MESSAGE: ".blue + message)
                httpRequest.post(
                    host,
                    {json: {"id": id,                        
                            "dataFrame": message
                    }},
                    function (err, res, body){
                        if (!err){
                            console.log("HTTP POST RESPONSE ".red);
                            console.log("RESPONSE CODE: ".red + res.statusCode);
                            console.log("RESPONSE BODY: ".red + body.message);
                            console.log("-------------------------------------------------------------".red);
                        }
                    });
                setTimeout(function(){commandInput()}, 2000);
        }
    })

}

setTimeout(function(){commandInput()}, 1500);


