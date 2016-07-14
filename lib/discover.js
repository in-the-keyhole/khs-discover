var express = require('express');
var app = express();
var log4js = require('log4js');
var config = require('./config');
var logger = log4js.getDefaultLogger();
var path = require('path');
var os = require('os');
var _isClient = false;
var startTime = new Date();

exports = module.exports;
exports.EnableDiscoveryServer = function () {
    _isClient = false;
    initDiscoveryServer();
}

exports.EnableDiscoveryClient = function () {
    _isClient = true;
    initDiscoveryClient();
};

function initDiscoveryClient() {
    logger.log('khs-discovor setup as client');

}

var registration = {
    "serviceName": config.server.name
};


function Application(name) {
    var application = {};
    application.name = "";
    application.port = -1;
    application.host = "";

    return application;
}

function getStatus() {

    return "up";
}

function initDiscoveryServer() {
    logger.log('khs-discovor setup as server');

    registration.apps = [];
    app.use(express.static(__dirname + '/client/'));


    app.get('/api/instanceInfo', function (req, res) {
        var obj = {
            cpuCount: "",
            hostName: "",
            ipaddress: "",
            status: ""
        };
        var networkInterfaces = os.networkInterfaces();
        obj.cpuCount = os.cpus().length;
        obj.hostName = os.hostname();
        obj.ipaddress = networkInterfaces['en0'][1].address;
        obj.status = getStatus();
        obj.startTime = startTime;
        res.json(obj);
    });


    app.get('/api/apps', function (req, res) {

        return res.json(registration);
    });

    app.post('/api/register', function (req, res) {

        var app = new Application();
        registration.apps.push(app);
        return res.json(app);
    });

    app.listen(config.server.port, function () {
        logger.log('discovery server started on port :', config.server.port);
    });
}