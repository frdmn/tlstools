#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var cmdr = require('commander'),
    helpers = require('./lib/helper')
    openssl = require('openssl-cert-tools');

/* Logic */

// Setup sub command options
cmdr
  .option('-f, --filename <file>', 'search certificate in file')
  .option('-H, --hostname <host[:port]>', 'use certificate from remote hostname')
  .option('-c, --clipboard', 'search certificate in clipboard')
  .parse(process.argv);

// Declare variables
var haystack;

// If "--hostname" is set
if(cmdr.hostname){
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

  // Extact certificate using OpenSSL
  openssl.getCertificate(hostName, hostPort, function(err, crt){
    if (err) {
      helpers.die('Couldn\'t extract certificate for "' + hostName + ':' + hostPort + '"');
    }

    helpers.resolveCertificateChain(crt, function(repairResponse){
      if (repairResponse !== false) {
        helpers.out(repairResponse);
        helpers.success('Successfully fixed intermediate chain for "' + hostName + '"');
        helpers.quit(0);
      } else {
        helpers.die('Couldn\'t extract certificate from file "' + fileName + '"');
      }
    });
  });
// If "--input-file" is set
} else if (cmdr.filename) {
  var fileName = cmdr.filename;
  helpers.checkIfFileExists(fileName, function(exists){
    if (exists){
      haystack = helpers.getFileContent(fileName);
      helpers.resolveCertificateChain(haystack, function(repairResponse){
        if (repairResponse !== false) {
          helpers.out(repairResponse);
          helpers.success('Successfully fixed intermediate from file "' + fileName + '" chain');
          helpers.quit(0);
        } else {
          helpers.die('Couldn\'t extract certificate from file "' + fileName + '"');
        }
      });
    } else {
      helpers.die('Couldn\'t access file "' + fileName + '"');
    }
  });
// otherwise check clipboard...
} else if (cmdr.clipboard) {
  haystack = helpers.getClipboard();
  helpers.resolveCertificateChain(haystack, function(repairResponse){
    if (repairResponse !== false) {
      helpers.out(repairResponse);
      helpers.success('Successfully fixed intermediate chain from clipboard');
      helpers.quit(0);
    } else {
      helpers.die('Couldn\'t extract certificate from clipboard');
    }
  });
} else {
  helpers.error('No option passed');
  cmdr.help();
}
