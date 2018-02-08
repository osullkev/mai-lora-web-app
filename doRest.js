/*jslint node: true, sloppy: true, bitwise: true, vars: true, eqeq: true, plusplus: true, nomen: true, es5:true */

var http = require('http');
var https = require('https');



exports.doRest = function (method, path, body, callback, serverCfg) {

    console.log(method + " REST: " + path);

    try {
        var obj = null;
        var options = {
            hostname: serverCfg.host,
            port: serverCfg.port,
            headers: {
                'Accept': 'Application/json'
            },
            path: path,
            method: method
        };

        if (serverCfg.host_user != null && serverCfg.host_password != null) {
            options.headers.Authorization = 'Basic ' + new Buffer(serverCfg.host_user + ":" + serverCfg.host_password).toString("base64");
        }

        if (typeof body === "object") {
            //console.log("body is an object");
            options.headers["Content-Type"] = "Application/json";
        }

        // console.log(options);

        var h = (serverCfg.protocol == "https") ? https : http;

        var req = h.request(options, function (res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.body = "";
            res.on('end', function () {

                console.log("---------------------------------------------------");
                console.log("Answer to " + options.method + " " + options.path);
                console.log("statusCode: ", res.statusCode);
                console.log(res.body);
                console.log("---------------------------------------------------");

                if (res.statusCode != 200) {
                    callback(res.statusCode, null);
                } else if (res.body.length > 0) {
                    try {
                        obj = JSON.parse(res.body);
                        callback(res.statusCode, obj);

                    } catch (e) {
                        console.log("Received from host: " + res.body);
                        callback(res.statusCode, null);
                    }
                } else {
                    callback(res.statusCode, {});
                }
            });

            res.on('data', function (d) {
                res.body += d.toString("utf8");
            });
        });

        if (body != null) {
            if (typeof body === "object") {
                req.write(new Buffer(JSON.stringify(body), "utf8"));
                console.log(body);
            } else {
                req.write(body);
            }
        }
        req.end();

        req.on('error', function (e) {
            console.error(serverCfg.protocol + " request error: " + JSON.stringify(e));
            // console.log(e);
        });
    } catch (e) {
        callback(-1, null);
    }
};