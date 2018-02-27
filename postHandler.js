uplinkHandler = require('./uplink-handler.js');

exports.handlePost = function (req, res){

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

        } catch (ex) {
            console.log("error in payload - no json object found");
            console.log(payload);

            res.status(404).json({"message": "Response from POST"}); // Returning empty body & 202 in order to keep payloads on the DASS
        }
    });

}