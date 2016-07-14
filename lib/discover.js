var express = require('express');
var app = express();
var log4js = require('log4js');
var config = require('.././config');
var logger = log4js.getDefaultLogger();




var registration = {
    "serviceName" : config.server.name
};
registration.apps = [];
function Application(name){
    var application = {};
    application.name = "";
    application.port = -1;
    application.host = "";




    return application;
}

app.get('/apps', function(req,res){

    return res.json(registration);
});

app.post('/register',function (req, res) {

    var app = new Application();
    registration.apps.push(app);
    return res.json(app);
});

app.listen(config.server.port, function(){
    logger.log('discovery server started on port :' , config.server.port);

});
