#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var cmdr = require('commander'),
    helpers = require('./helper');

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

  // Resolve DNS name
  helpers.resolveDns(hostName, function(ip){
    // Connect to ssldecoder.org API
    helpers.sslDecoderApi(hostName, ip, hostPort, function(response){
      // If 'data' element, select and store certificate
      if (response.data) {
        haystack = response.data.chain['1'].key.certificate_pem;
        helpers.attemptToFixChain(haystack, function(repairResponse){
          if (repairResponse !== false) {
            helpers.out(repairResponse);
            helpers.success('Successfully fixed intermediate chain for "' + hostName + '".');
            helpers.quit(0);
          }
        });
      } else {
        helpers.error('Couldn\'t extract certificate for "' + hostName + ':' + hostPort + '".');
        helpers.quit(1);
      }
    });
  });
// If "--input-file" is set
} else if (cmdr.filename) {
  var fileName = cmdr.filename;
  helpers.checkIfFileExists(fileName, function(exists){
    if (exists){
      haystack = helpers.getFileContent(fileName);
      helpers.attemptToFixChain(haystack, function(repairResponse){
        if (repairResponse !== false) {
          helpers.out(repairResponse);
          helpers.success('Successfully fixed intermediate from file "' + fileName + '" chain.');
          helpers.quit(0);
        } else {
          helpers.error('Couldn\'t extract certificate from file "' + fileName + '".');
          helpers.quit(1);
        }
      });
    } else {
      helpers.error('Couldn\'t access file "' + fileName + '".');
      helpers.quit(1);
    }
  });
// otherwise check clipboard...
} else if (cmdr.clipboard) {
  haystack = helpers.getClipboard();
  helpers.attemptToFixChain(haystack, function(repairResponse){
    if (repairResponse !== false) {
      helpers.out(repairResponse);
      helpers.success('Successfully fixed intermediate chain from clipboard.');
      helpers.quit(0);
    } else {
      helpers.error('Couldn\'t extract certificate from clipboard.');
      helpers.quit(1);
    }
  });
} else {
  helpers.error('No option passed');
  cmdr.help();
}
