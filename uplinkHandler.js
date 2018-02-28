var downlink = require('./downlinkHandler.js');
var sensorReadingHandler = require('./uplinkHandlers/sensorReadingHandler.js');
var nodeStatusHandler = require('./uplinkHandlers/nodeStatusHandler.js');
var fwUpdateHandler = require('./uplinkHandlers/firmwareUpdateHandler.js');
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

var pingNode = function(nodeMessage){
    console.log("Pinging node...");
    var postData  = nodeMessage + nodeMessage;
    downlink.sendDownlink('0', postData);
}

exports.handleUplink = function (uplinkJSON){
    var dataFrame = uplinkJSON.dataFrame.toUpperCase();
    var packetJSON = utils.parseToPacketComponents(dataFrame);
    console.log("UPLINK PACKET: ".blue);
    utils.logJSONObject(packetJSON, 'green');
    switch (packetJSON.header.opcode){
        case '1':
            //Sensor reading-no acknowledgement expected
            sensorReadingHandler.handleSensorReading(packetJSON.payload, false);
            break;
        case '2':
            //Sensor reading-acknowledgement expected
            sensorReadingHandler.handleSensorReading(packetJSON.payload, true);
            break;
        case '3':
            //Node status
            nodeStatusHandler.handleNodeStatus(packetJSON.payload);
            break;
        case '4':
            //FIRMWARE UPDATE-INITIALISE PROCESS
            setTimeout(function(){
                pingNode(packetJSON.payload);
            }, 1000);
            break;
        case '5':
            //FIRMWARE UPDATE-REQUEST PACKET
            break;
        case '6':
            // FIRMWARE UPDATE-ALL PACKETS RECEIVED/INTEGRITY CHECK
            break;
        case '7':
        case '8':
        case '9':
        case 'A':
        case 'B':
        case 'C':
        case 'D':
        case 'E':
        case 'F':
        case '0':
        default:
            // Do nothing
            console.log("UNKNOWN OPERATIONAL CODE");

    }
}
