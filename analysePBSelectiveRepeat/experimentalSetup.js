var path =
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf10/1000b/logs_2018-4-21__11-26-39"
"/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf10/3000b/logs_2018-4-21__9-23-30"


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