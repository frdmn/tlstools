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
  .option('-i, --input-file [file]', 'input file that contains certificate')
  .option('-h, --hostname [host]', 'hostname to check')
  .parse(process.argv);

// Declare variables
var haystack;

if(cmdr.hostname){
  helpers.resolveDns(cmdr.hostname, function(ip){
    helpers.sslDecoderApi(cmdr.hostname, ip, "443", function(response){
      if (response.data) {
        haystack = response.data.chain['1'].key.certificate_pem;
        helpers.attemptToFixChain(haystack, function(repairResponse){
          if (repairResponse !== false) {
            console.log(repairResponse);
            helpers.success('Successfully fixed intermediate chain for "' + cmdr.hostname + '".');
            helpers.quit(0);
          }
        });
      } else {
        helpers.error('Couldn\'t extract certificate for "' + cmdr.hostname + '".');
      }
    });
  });
} else {
  // If "--input-file" is set
  if (cmdr.inputFile) {
    haystack = helpers.getFileContent(cmdr.inputFile);
    helpers.attemptToFixChain(haystack, function(repairResponse){
      if (repairResponse !== false) {
        console.log(repairResponse);
        helpers.success('Successfully fixed intermediate from file "' + cmdr.inputFile + '" chain.');
        helpers.quit(0);
      } else {
        helpers.error('Couldn\'t extract certificate from file "' + cmdr.inputFile + '".');
      }
    });
  // If "--input-file" is set
  } else {
    haystack = helpers.getClipboard();
    helpers.attemptToFixChain(haystack, function(repairResponse){
      if (repairResponse !== false) {
        console.log(repairResponse);
        helpers.success('Successfully fixed intermediate chain from clipboard.');
        helpers.quit(0);
      } else {
        helpers.error('Couldn\'t extract certificate from clipboard.');
      }
    });
  }
}
