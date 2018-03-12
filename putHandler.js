var u = require('url');
var nodeConfig = require('./nodeConfig.js');
var logHandler = require('./loggingHandler.js');
require('colors');

exports.handlePut = function (req, res) {

    console.log("--------------");
    console.log("Received Message put on URL : ".yellow + req.url);
    var url = u.parse(req.url);
    console.log("PUT DETAILS:".yellow + JSON.stringify(url));

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

            //Logging out the payload object
            console.log("PUT PAYLOAD: ".yellow + JSON.stringify(obj));

            logHandler.restAPILogger.log('info', 'INCOMING HTTP PUT', obj);

            nodeConfig.updateNodeInfo(obj);

            res.status(202).json({}); // Returning empty body & 202 in order to keep payloads on the DASS


        } catch (ex) {
            console.log("error in payload - no json object found");
            console.log("received payload: " + payload);
            res.status(404).json({}); // Returning empty body & 202 in order to keep payloads on the DASS

            throw ex;
        }

    });
}
