var express = require('express');
var app = express();
var log4js = require('log4js');
var _config = require('./config');
//var logger = log4js.getDefaultLogger();
var path = require('path');
var os = require('os');
var _isClient = false;
var startTime = new Date();
var rp = require('request-promise');

exports = module.exports;
exports.config = function (config) {
    if (config.server) {
        if (config.server.port) {
            _config.server.port = config.server.port;
        }

        if (config.server.name) {
            _config.server.name = config.server.name;
        }
    }

    if (config.client) {
        if (config.client.host) {
            _config.client.host = config.client.host;
        }
        if (config.client.name) {
            _config.client.name = config.client.name;
        }
        if (config.client.port) {
            _config.client.port = config.client.port;
        }
    }
};

exports.EnableDiscoveryServer = function () {
    _isClient = false;
    initDiscoveryServer();
};

exports.EnableDiscoveryClient = function () {
    _isClient = true;
    initDiscoveryClient();
};

function initDiscoveryClient() {
    console.log('khs-discovor setup as client');
    var application = new Application();
    application.name = _config.client.name;
    application.host = _config.client.host;
    application.port = _config.client.port;

    regCb();
    function regCb() {

        var options = {
            method: 'POST',
            uri: _config.client.host + ':' + _config.client.port + '/api/register',
            body: {application: application}
        };
        //console.log(options.body);
        rp(options)
            .then(function (data) {
                console.log('registered with server');
            })
            .catch(function () {
                console.log('unable to register with server');
                setTimeout(regCb, 5000);
            });
    }
}

var registration = {
    "serviceName": _config.server.name
};


function Application() {
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
    console.log('khs-discovor setup as server');

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

    app.post('/api/status', function (req, res) {

        req.status(200).send();
    });

    app.post('/api/register', function (req, res) {

        registration.apps.push(res.body.application);
        console.log('app registered' + res.body.application.name);
        return res.json(res.body.application);
    });

    app.listen(_config.server.port, function () {
        console.log('discovery server started on port :', _config.server.port);
    });
}
