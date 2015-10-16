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
  .option('-i, --input-file <file>', 'input file that contains certificate')
  .option('-H, --hostname <host>', 'hostname to check')
  .option('-p, --port <port>', 'optional port, otherwise 443')
  .parse(process.argv);

// Declare variables
var haystack;

// If "--hostname" is set
if(cmdr.hostname){
  helpers.resolveDns(cmdr.hostname, function(ip){
    var hostPort = cmdr.port ? cmdr.port : '443';
    helpers.sslDecoderApi(cmdr.hostname, ip, hostPort, function(response){
      if (response.data) {
        haystack = response.data.chain['1'].key.certificate_pem;
        helpers.attemptToFixChain(haystack, function(repairResponse){
          if (repairResponse !== false) {
            helpers.out(repairResponse);
            helpers.success('Successfully fixed intermediate chain for "' + cmdr.hostname + '".');
            helpers.quit(0);
          }
        });
      } else {
        helpers.error('Couldn\'t extract certificate for "' + cmdr.hostname + ':' + hostPort + '".');
        helpers.quit(1);
      }
    });
  });
} else {
  // If "--input-file" is set
  if (cmdr.inputFile) {
    haystack = helpers.getFileContent(cmdr.inputFile);
    helpers.attemptToFixChain(haystack, function(repairResponse){
      if (repairResponse !== false) {
        helpers.out(repairResponse);
        helpers.success('Successfully fixed intermediate from file "' + cmdr.inputFile + '" chain.');
        helpers.quit(0);
      } else {
        helpers.error('Couldn\'t extract certificate from file "' + cmdr.inputFile + '".');
        helpers.quit(1);
      }
    });
  // otherwise check clipboard...
  } else {
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
  }
}
