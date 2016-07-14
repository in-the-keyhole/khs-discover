(function () {
    var express = require('express');
    var app = express();
    var log4js = require('log4js');
    var _config = require('./config');
    var path = require('path');
    var os = require('os');
    var networkInterfaces = os.networkInterfaces();
    var _isClient = false;
    var startTime = new Date();
    var rp = require('request-promise');
    var bodyParser = require('body-parser');
    var guid = require('guid');
    app.use(bodyParser.json());
    var appuid = {};
    exports = module.exports;

    exports.config = function (config) {
        if (config.server) {
            if (config.server.port) {
                _config.server.port = config.server.port;
            }

            if (config.server.name) {
                _config.server.name = config.server.name;
            }

            if (config.server.hostname) {
                _config.server.hostname = config.server.hostname;
                if (!(/(http)/g).test(_config.server.hostname))
                    _config.server.hostname = 'http://' + _config.server.hostname;
            }

            if (config.server.refresh) {
                _config.server.refresh = config.server.refresh;
            }
        }

        if (config.client) {
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
        application.hostname = os.hostname();
        application.port = _config.client.port;
        application.ipaddress = networkInterfaces['en0'][1].address;

        //setStatus();
        function setStatus() {
            //console.log('pushing status');
            var options = {
                method: 'POST',
                uri: _config.server.hostname + ':' + _config.server.port + '/api/status',
                body: {uid: appuid, status: 'up', date: new Date()},
                json: true
            };
            rp(options)
                .then(function (err, data) {

                })
                .catch(function (err) {
                    console.log('status update err : ' + err);
                });
            setTimeout(setStatus, 5000);
        }


        regCb();
        function regCb() {

            var options = {
                method: 'POST',
                uri: _config.server.hostname + ':' + _config.server.port + '/api/register',
                body: application,
                json: true
            };
            //console.log(options.body);
            rp(options)
                .then(function (data) {
                    console.log('registered with server');
                    appuid = data.uid;
                    setStatus();
                })
                .catch(function (err) {
                    console.log('unable to register with server : ' + err);
                    setTimeout(regCb, 5000);
                });
        }
    }

    var registration = {
        "serviceName": _config.server.name
    };


    function Application() {
        return {
            uid: "",
            name: "",
            port: -1,
            hostname: "",
            ipaddress: "",
            status: "unknown",
            date: new Date()
        };
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
            //res.status(200).send();
            for (var i = 0; i < registration.apps.length; i++) {
                if (req.body.uid == registration.apps[i].uid) {
                    registration.apps[i].status = req.body.status;
                    registration.apps[i].date = new Date;
                    res.json(registration.apps[i]);
                }
            }

        });

        app.post('/api/register', function (req, res) {

            var app = req.body;
            app.uid = guid.raw();
            registration.apps.push(app);
            console.log('app registered :' + JSON.stringify(req.body));

            return res.json({uid: app.uid});
        });

        app.listen(_config.server.port, function () {
            console.log('discovery server started on port :', _config.server.port);
        });

        function checkStatus() {
            for (var i = 0; i < registration.apps.length; i++) {
                //registration.apps[i].application.uid
                var now = new Date();
                if (registration.apps[i].date) {
                    var exp = registration.apps[i].date - now;
                    if(exp > _config.server.expireRate){
                        registration.apps[i].status = "down";
                    }else{
                    }
                }

                //expireRate
            }
            setTimeout(checkStatus, _config.server.refresh);
        }

        checkStatus();
    }

})();
