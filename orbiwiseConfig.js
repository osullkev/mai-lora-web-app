var rest = require('./doRest.js');

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

var local_test = false;
var config;

exports.setLocalTest = function (b) {
    local_test = b;
    if(local_test)
        config = dummyConfig;
    else
        config = dassConfig;
};

exports.config = function(){return config};

/* Stop Push function */
exports.stopPush = function () {
    rest.doRest("PUT", "/rest/pushmode/stop", null, function (status, m) {
        if (status == 200) {
            console.log("*** stopping pushmode to app server");
        } else {
            console.log("Error with status " + status + " -> Push Mode not stopped -> received : " + JSON.stringify(m));
        }
    }, dassConfig);
};

// ---------------------------------------------------------------------------

/* Building StartPush Object, application server and starting server
    // JSON object to put for PUSH registration */
/* {
    “host”: “hostname”,      // Hostname or IP address of App server interface
    “port”: 1234,            // port number of DASS HTTPS host interface
    “path_prefix”: “/abc”,   // path prefix
    “auth_string”: “string”, // see below
    “retry_policy”: 0        // see details in the API specification
} */

/* Start Push function */
exports.startPush = function (server, appSrvrHost, appSrvrPort) {
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
    pushRegObject.host = appServrProtocol + "://" + appSrvrHost;
    console.log(pushRegObject);

    rest.doRest("PUT", "/rest/pushmode/start", pushRegObject, function (status, m) {

        if (status == 200) {
            console.log("***  app server registered for push".green);
            console.log("--------------------------------------------------------".green)
            console.log("--------------------------------------------------------".green)
        } else {
            console.log("Error with status " + status + " -> Push Mode not started -> received : " + JSON.stringify(m));
        }


    }, dassConfig);
};
