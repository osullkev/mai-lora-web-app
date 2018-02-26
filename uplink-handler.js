/*
OPCODE  MESSAGE TYPE    PAYLOAD
------  ------------    -------
0000    RESERVED        EMPTY
0001    RESERVED        EMPTY
0010    RESERVED        EMPTY
0011    RESERVED        EMPTY
0100    RESERVED        EMPTY
0101    RESERVED        EMPTY
0110    RESERVED        EMPTY
0111    RESERVED        EMPTY
1000    RESERVED        EMPTY
1001    RESERVED        EMPTY
1010    RESERVED        EMPTY
1011    RESERVED        EMPTY
1100    RESERVED        EMPTY
1101    RESERVED        EMPTY
1110    RESERVED        EMPTY
1111    RESERVED        EMPTY
*/

exports.handleUplink = function (uplinkJSON){
    console.log("UPLINK:" + uplinkJSON.dataFrame);
    var dataFrame = uplinkJSON.dataFrame;
    var opcode = dataFrame.substring(0,2);
    var payload = dataFrame.substring(2);
    console.log("OPCODE: " + opcode);
    console.log("PAYLOAD: " + payload);
}