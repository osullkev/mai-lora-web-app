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
var rest = require('./doRest.js');
var u = require('url');
var uplinkHandler = require('./uplink-handler.js');
require('colors');


/* Credentials to DASS server */
/* Enter credentials for ns1.pervasivenation.com here*/

var dass_user = "jdukes_tcd";
var dass_password = "jdukes1234";

var dassConfig = {
    "protocol": "https",
    "host": "ns1.pervasivenation.com",
    "host_user": dass_user,
    "host_password": dass_password,
    "port": 443
};

/* Credentials for Dummy DASS Server for testing purposes */

var dummyConfig = {
    "protocol": "http",
    "host": "localhost",
    "host_user": dass_user,
    "host_password": dass_password,
    "port": 5050
};

var config;
if (!local_test){
    config = dassConfig;
}
else{
    config = dummyConfig;
}

var log = function (o) {
    if (debug) {
        console.log(o);
    }
};

var dlFcnt = 10;

var pingNode = function(nodeMessage){

    if (nodeMessage == 'bb') {
        dlFcnt = dlFcnt+1;
        console.log("Pinging node...");
 
        var postData = new Buffer(nodeMessage + nodeMessage, 'hex').toString('base64');

        var postDataJson = {'message': "This is the ping"};
        
        rest.doRest("POST", "/rest/nodes/0004a30b001b0af1/payloads/dl?fcnt="+dlFcnt+"&port=01", postData, function (status, m) {

        }, 
            config);
    }
}


// allow to do HTTPS to self signed servers.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
   PUSH REGISTER / UNREGISTER functions
*/

if (action == "stop") {
    /* Stop Push function */
    var stopPush = function () {
        rest.doRest("PUT", "/rest/pushmode/stop", null, function (status, m) {
            if (status == 200) {
                console.log("*** stopping pushmode to app server");
            } else {
                console.log("Error with status " + status + " -> Push Mode not stopped -> received : " + JSON.stringify(m));
            }
        }, dassConfig);
    };

    // Stropping Push mode
    stopPush();



} else {


    /* Building StartPush Object, application server and starting server
    // JSON object to put for PUSH registration */
    /* {
        “host”: “hostname”,      // Hostname or IP address of App server interface
        “port”: 1234,            // port number of DASS HTTPS host interface
        “path_prefix”: “/abc”,   // path prefix
        “auth_string”: “string”, // see below
        “retry_policy”: 0        // see details in the API specification
    } */

    var appSrvrPort = parseInt(args[2], 10);
    var appSrvrHost = args[3];
    var appSrvrUsr = "";
    var appSrvrPwd = "";
    var appServrProtocol = "http";

    // Authorisation string, "Basic " followed by "user:password" base64 encoded
    var auth_string = "Basic " + new Buffer(appSrvrUsr + ":" + appSrvrPwd).toString('base64');

    var pushRegObject = {
        host: appSrvrHost,
        port: appSrvrPort,
        path_prefix: "/",
        auth_string: auth_string,
        retry_policy: 0 // no retry
    };


    /* Start Push function */
    var startPush = function (server) {

        pushRegObject.host = appServrProtocol + "://" + appSrvrHost;
        log(pushRegObject);

        rest.doRest("PUT", "/rest/pushmode/start", pushRegObject, function (status, m) {

            if (status == 200) {
                console.log("***  app server registered for push".green);
                console.log("--------------------------------------------------------".green)
                console.log("--------------------------------------------------------".green)
            } else {
                log("Error with status " + status + " -> Push Mode not started -> received : " + JSON.stringify(m));
            }


        }, dassConfig);
    };


    /* 
     *
     *  APPLICATION SERVER 
     *  -> creating a http server that forwards all received payloads to a server
     *
     */



    var cfg;
    var userName;

    // Application server declaration, using express.js
    var appServer = express();
    var httpServer = http.createServer(appServer).listen(appSrvrPort, function () {
        var host = httpServer.address().address;
        var port = httpServer.address().port;
        console.log('Starting server listening on port ' + port);

        // Registration for PUSH
        startPush(null, host);

    });



    // PUT management from DASS
    appServer.put('/*', function (req, res) {

        log("--------------");
        log("Received Message put on URL : " + req.url);
        var url = u.parse(req.url);
        log(url);

        req.setEncoding('utf8');

        var payload = '';
        req.on('data', function (chunk) {
            payload += chunk;
        });

        // When the message body is available we can do the query.
        req.on('end', function () {
            try {
                var obj = JSON.parse(payload);
                if (obj.dataFrame) {
                    obj.dataFrame = new Buffer(obj.dataFrame, 'Base64').toString("hex");
                }

                if (obj.timestamp) {
                    if (obj.timestamp.toUpperCase().search("Z") >= 0) {
                        obj.timestamp = new Date(obj.timestamp).toJSON();
                    } else {
                        obj.timestamp = new Date(obj.timestamp + "Z").toJSON();
                    }
                }


                if (obj.gtw_json) {
                    obj.gtw_json = JSON.parse(obj.gtw_json);
                }

                obj.type = req.url.replace("/rest/callback/", "");



                log(obj);
				
				//Logging out the payload object
				console.log(obj);

            } catch (ex) {
                console.log("error in payload - no json object found");
                console.log("received payload: " + payload);
            }

        });
        res.status(202).json({}); // Returning empty body & 202 in order to keep payloads on the DASS
    });




    // POST managament from DASS 
    appServer.post('/*', function (req, res) {

        console.log("------------------------------------------------".magenta);
        console.log("RECEIVING HTTP POST".magenta);
        console.log("URL:".magenta + req.url);
        
        req.setEncoding('utf8');

        var payload = '';
        req.on('data', function (chunk) {
            payload += chunk;
        });

        var d = 0;

        // When the message body is available we can do the query.
        req.on('end', function () {
            try {
                console.log("PAYLOAD: ".magenta + payload);
                var obj = JSON.parse(payload);
                if (obj.dataFrame) {
                    obj.dataFrame = new Buffer(obj.dataFrame, 'Base64').toString("hex");
                }
                if (obj.timestamp) {
                    obj.timestamp = new Date(obj.timestamp).toJSON();
                }

                if (obj.gtw_json) {
                    obj.gtw_json = JSON.parse(obj.gtw_json);
                }

                obj.type = req.url.replace("/rest/callback/", "");

                console.log("PARSED PAYLOAD: ".magenta + JSON.stringify(obj));

                //Logging out the payload object
                d = obj.dataFrame;
                res.status(202).json({}); // Returning empty body & 202 in order to keep payloads on the DASS

                uplinkHandler.handleUplink(obj);

                setTimeout(function(){
                    pingNode(d);
                }, 1000);

            } catch (ex) {
                log("error in payload - no json object found");
                log(payload);

                res.status(404).json({"message": "Response from POST"}); // Returning empty body & 202 in order to keep payloads on the DASS
            }
        });
       
    });
}
