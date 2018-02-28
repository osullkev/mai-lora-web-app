# LoRa Web Appliation
### MAI Project Trinity College Dublin

To install run: `npm install`

To start public service: `node server.js <port> <host>`
To start local service for testing with dummy DASS: node server.js <port> localhost local_test


A dummy DASS service can be used for testing locally. 
To start dummy service: `node dassServer.js <port> <dummy-host> debug_log`
where `<dummy-host>` is different from `<host>`. 