var path =
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf11/7000b/logs_2018-4-17__23-21-22"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf12/2000b/logs_2018-4-18__21-15-6"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf12/3000b/logs_2018-4-19__7-19-1"
// "/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf12/5000b/logs_2018-4-19__16-22-50"
"/home/osullkev/projects/internal/mai-project/mai-lora-web-app/piggybacked-selective-repeat-logs/sf12/6000b/logs_2018-4-20__3-34-6"


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