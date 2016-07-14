"use strict";

module.exports = require('./lib/discover');

var discoveryClient = require('khs-discover');
discoveryClient.config({
    client: {
        hostname: "localhost",
        port: 8762,
        name: "test app"
    }
});
discoveryClient.EnableDiscoveryClient();


var discoveryServer = require('khs-discover');
discoveryServer.config({
    server: {
        name: "ksh-discover",
        port: 8762
    }
});
discoveryServer.EnableDiscoveryServer();