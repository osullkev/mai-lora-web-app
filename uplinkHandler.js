var downlink = require('./downlinkHandler.js');
var sensorReadingHandler = require('./uplinkHandlers/sensorReadingHandler.js');
var nodeStatusHandler = require('./uplinkHandlers/nodeStatusHandler.js');
var fwUpdateHandler = require('./uplinkHandlers/firmwareUpdateHandler.js');
var logHandler = require('./loggingHandler.js');
var utils = require('./utilityFunctions.js');




/*
OPCODE  MESSAGE TYPE                            PAYLOAD
------  ------------                            -------
0000    RESERVED                                EMPTY
0001    SENSOR READING-NO ACK EXPECTED          SENSOR READING VALUE
0010    SENSOR READING-ACK EXPECTED             SENSOR READING VALUE
0011    NODE STATUS                             FW VERSION, BATTERY LIFE, ETC
0100    FIRMWARE UPDATE-INITIALISE PROCESS      EMPTY
0101    FIRMWARE UPDATE-REQUEST PACKET          IF EMPTY->SEND NEXT PACKET IN SEQ
                                                ELSE IF #i, j, k, ...-> RESEND PACKETS i,j,k,...
0110    FIRMWARE UPDATE-ALL PACKETS RECEIVED/   EMPTY
        INTEGRITY CHECK
0111    RESERVED                                EMPTY
1000    RESERVED                                EMPTY
1001    RESERVED                                EMPTY
1010    RESERVED                                EMPTY
1011    RESERVED                                EMPTY
1100    RESERVED                                EMPTY
1101    RESERVED                                EMPTY
1110    RESERVED                                EMPTY
1111    RESERVED                                EMPTY
*/

exports.handleUplink = function (uplinkJSON){
    var dataFrame = uplinkJSON.dataFrame.toUpperCase();
    var port = uplinkJSON.port;
    var rssi = uplinkJSON.rssi;
    var snr = uplinkJSON.snr;
    var packetJSON = utils.parseToPacketComponents(dataFrame, snr, rssi);
    logHandler.nodeCommsLogger.log('info', 'INCOMING UPLINK', packetJSON);

    console.log("UPLINK PACKET: ".blue);
    utils.logJSONObject(packetJSON, 'green');
    switch (port)
    {
        case 1:
            switch (packetJSON.header.opcode)
            {
                case '1':
                    //Sensor reading-no acknowledgement expected
                    sensorReadingHandler.handleSensorReading(packetJSON.payload, false);
                    break;
                case '2':
                    //Sensor reading-acknowledgement expected
                    sensorReadingHandler.handleSensorReading(packetJSON.payload, true);
                    break;
                case '3':
                    nodeStatusHandler.handleNodeStatus(packetJSON.payload);
                    break;
                default:
                    console.log("UNKNOWN OPERATIONAL CODE");
            }
            break;
        case 2:
            switch (packetJSON.header.opcode)
            {
                case '0':
                    //FIRMWARE UPDATE-REQUEST PACKET
                    fwUpdateHandler.handlePacketRequest(packetJSON.payload);
                    break;
                case '1':
                    //FIRMWARE UPDATE-REQUEST PACKET
                    break;
                case '2':
                    // FIRMWARE UPDATE-ALL PACKETS RECEIVED/INTEGRITY CHECK
                    break;
                default:
                    console.log("UNKNOWN OPERATIONAL CODE");
            }
            break;
        default:
            console.log("UNSUPPORTED PORT");
    }
}
