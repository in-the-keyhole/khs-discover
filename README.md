# khs-discover


A Light weight nodejs discovery service

## Install

  npm install khs-discover --save

## To add to a service Client
    var discoveryClient = require('khs-discover');
        discoveryClient.config({
            server: {
                name: "ksh-discover",
                port: 8762,
                hostname: "localhost"
            },
            client: {
                port: 3000 + i,
                name: "test app " + i
            }
        });
    discoveryClient.EnableDiscoveryClient();

## To create a Discovery Server
    var discovery = require('khs-discover');
    discovery.config({
      server: {
          name: "ksh-discover",
          port: 8762
      }
    });
    discovery.EnableDiscoveryServer();
  
## Release History
* 1.0.7 Starting Point
* 1.0.0 Initial release