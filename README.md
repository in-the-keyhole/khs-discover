# khs-discover


A Light weight nodejs discovery service

## How to Install

    npm install khs-discover --save

## To add to a service Client
    var discoveryClient = require('khs-discover');
        discoveryClient.config({
            server: {
                port: 8762,
                hostname: "localhost"
            },
            client: {
                port: 3000,
                name: "Example App"
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
* 1.0.8 Starting Point
    - added site
    - added status feature
    - added status walk
    - added client - server commuication
    - added uid to host
* 1.0.0 Initial release