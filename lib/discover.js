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
    var _inst = new Instance();
    ;
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
            if (config.client.refreshStatus) {
                _config.client.refreshStatus = config.client.refreshStatus;
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
        //var instance = new Instance();
        _inst.name = _config.client.name;
        _inst.hostname = os.hostname();
        _inst.port = _config.client.port;
        _inst.ipaddress = networkInterfaces['en0'][1].address;

        //setStatus();
        function setStatus() {
            //console.log('pushing status');
            var options = {
                method: 'POST',
                uri: _config.server.hostname + ':' + _config.server.port + '/api/status',
                body: {uid: _inst.uid, appId: _inst.appId, status: 'up', date: new Date()},
                json: true
            };
            rp(options)
                .then(function (data) {
                    setTimeout(setStatus, _config.client.refreshStatus);
                })
                .catch(function (err) {
                    console.log('status update err : ' + err);
                    regCb();
                });

        }


        regCb();
        function regCb() {

            var options = {
                method: 'POST',
                uri: _config.server.hostname + ':' + _config.server.port + '/api/register',
                body: _inst,
                json: true
            };
            //console.log(options.body);
            rp(options)
                .then(function (data) {
                    console.log('registered with server: ' + data.uid);
                    _inst.appId = data.appId;
                    _inst.uid = data.uid;
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
            appId: "",
            name: "",
            instances: []
        };
    }

    function Instance() {
        return {
            appId: "",
            uid: "",
            name: "",
            port: -1,
            hostname: "",
            ipaddress: "",
            status: "unknown",
            date: new Date()
        }
    }

    function initDiscoveryServer() {
        console.log('khs-discover setup as server');

        registration.apps = [];
        //registration.instances = [];
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
            obj.status = 'up';
            obj.startTime = startTime;
            res.json(obj);
        });


        app.get('/api/apps', function (req, res) {
            return res.json(registration);
        });

        app.post('/api/status', function (req, res) {
            //res.status(200).send();
            for (var i = 0; i < registration.apps.length; i++) {
                if (registration.apps[i].appId === req.body.appId) {
                    for (var x = 0; x < registration.apps[i].instances.length; x++) {
                        if (registration.apps[i].instances[x].uid === req.body.uid) {
                            registration.apps[i].instances[x].status = 'up';
                            res.json({status: 'up'});
                            return;
                        }
                    }
                }
            }
            res.status(404).send();
        });

        app.post('/api/register', function (req, res) {

            var instance = req.body;
            instance.uid = guid.raw();

            var foundApp = false;
            for (var i = 0; i < registration.apps.length; i++) {
                if (registration.apps[i].name === instance.name) {
                    foundApp = true;
                    var foundInstance = false;
                    for (var x = 0; x < registration.apps[i].instances.length; x++) {
                        if (registration.apps[i].instances[x].hostname === instance.hostname) {
                            if (registration.apps[i].instances[x].ipaddress === instance.ipaddress) {
                                if (registration.apps[i].instances[x].port === instance.port) {
                                    foundInstance = true;
                                    return res.json({appId: registration.apps[i].instances[x].appId, uid: registration.apps[i].instances[x].uid });
                                }
                            }
                        }
                    }

                    if (!foundInstance) {
                        instance.appId = registration.apps[i].appId;
                        registration.apps[i].instances.push(instance);
                    }
                }
            }
            if (!foundApp) {
                var app = new Application();
                app.name = instance.name;
                app.appId = guid.raw();
                app.instances.push(instance);
                instance.appId = app.appId;
                registration.apps.push(app);
            }

            console.log('app registered :' + JSON.stringify(req.body));

            return res.json({appId: instance.appId, uid: instance.uid});
        });

        app.listen(_config.server.port, function () {
            console.log('discovery server started on port :', _config.server.port);
        });

        function checkStatus() {
            for (var i = 0; i < registration.apps.length; i++) {
                for (x = 0; x < registration.apps[i].instances.length; x++) {
                    var now = new Date();
                    if (registration.apps[i].instances[x].date) {
                        var temp = new Date(registration.apps[i].instances[x].date);
                        var exp = now - temp;
                        if (exp > _config.server.expireRate) {
                            registration.apps[i].instances[x].status = "down";
                        } else {
                            registration.apps[i].instances[x].status = "up";
                        }
                    }
                }
            }
            setTimeout(checkStatus, _config.server.refresh);
        }

        checkStatus();
    }

})();
