# khs-discover


A Light weight nodejs discovery service

## Install

  npm install khs-discover --save

## To add to a service Client
    var discovery = require('khs-discover');
    discovery.config({
          client: {
              hostname: "localhost",
              port: 8762
          }
        });
    discovery.EnableDiscoveryClient();

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

* 1.0.0 Initial release