var path =
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf10/1000b/logs_2018-4-21__11-26-39"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/downlink-prioritised-piggybacked-selective-repeat-logs/sf10/2000b/logs_2018-4-21__13-51-3"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/downlink-prioritised-piggybacked-selective-repeat-logs/sf12/5000b/logs_2018-4-21__15-34-42"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/downlink-prioritised-piggybacked-selective-repeat-logs/sf10/5000b/logs_2018-4-22__7-51-57"
"/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf12/2000b/logs_2018-4-24__9-11-18"

var pathArray = path.split("/");
// console.log(pathArray);
var sf = pathArray[8];
var update = pathArray[9];
var date = pathArray[10].substring(5);

exports.getPath = function ()
{
    return path;

}

exports.getSF = function () {
    return sf;
}

exports.getDate = function () {
    return date;
}


exports.getUpdate = function () {
    return update;
}

exports.getArduinoFile = function () {
    return arduinoLogFile;
}

exports.getServerFile = function () {
    return serverLogFile;
}