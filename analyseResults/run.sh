#!/bin/bash

node cleanArduinoLog.js
node runAnalysis.js
node cleanPBSelServerLog.js
node parseServerJSON.js
node runAnalysis.js