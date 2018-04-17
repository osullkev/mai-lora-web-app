#!/bin/bash

node cleanArduinoLog.js
node parseArduinoLog.js
node cleanPBSelServerLog.js
node parseServerJSON.js
node runAnalysis.js