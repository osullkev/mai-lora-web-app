var path =
"/home/osullkev/projects/internal/mai-project/mai-lora-web-app/5000b-tests/sf12/5000b/logs_2018-5-2__22-11-45"




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