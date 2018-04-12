#!/bin/bash

node cleanArduinoLog.js
node parseArduinoLog.js
node cleanServerLog.js
node parseServerJSON.js
node runAnalysis.js