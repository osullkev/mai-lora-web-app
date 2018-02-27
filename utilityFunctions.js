var logJSONObject = function (obj){
    for (var x in obj){
        if (typeof obj[x] === 'object'){
            logJSONObject(obj[x]);
        }
        else {
            console.log(x.toString().toUpperCase() + ": " + obj[x]);
        }
    }
}
exports.logJSONObject = function(obj){
    logJSONObject(obj);
}