#!/usr/bin/env node

/*
 * Copyright (c) 2020 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var cmdr = require('commander'),
    helpers = require('./lib/helper'),
    openssl = require('openssl-cert-tools');

/* Logic */

// Setup sub command options
cmdr
  .option('-H, --hostname <host[:port]>', 'use certificate from remote hostname')
  .parse(process.argv);

// Declare variables
var haystack;

// If "--hostname" is set
if (cmdr.hostname) {
  var socketName = cmdr.hostname,
      socketArray = socketName.split(':');

  // Extract hostname from socketArray
  var hostName = socketArray[0];

  // If socketArray > 1 then it contains a port
  if (socketArray.length > 1){
    var hostPort = socketArray[1];
  } else {
    var hostPort = '443';
  }

  openssl.getCertificateChain(hostName, hostPort, function(err, crt){
    if(err){
      helpers.die('Error: received the following response from "getCertificateChain()":\n\n' + err);
    }

    helpers.resolveCertificateChain(crt[0], function(repairResponse){
      crt.splice(0, 1);

      if(crt.join('\n').trim() == repairResponse.trim()){
        helpers.success('Intermediate chain "' + hostName + ':' + hostPort + '" seems to be complete/correct');
        helpers.quit(0);
      } else {
        helpers.error('Intermediate chain for "' + hostName + ':' + hostPort + '" seems to be incomplete');
        console.log('   For detailed information, please check using SSLlabs: \n');
        console.log('   https://www.ssllabs.com/ssltest/analyze.html?d=' + hostName + ':' + hostPort + '&latest');
        helpers.quit(1);
      }
    });
  });

// otherwise check clipboard...
} else {
  helpers.error('No option passed');
  cmdr.help();
}
