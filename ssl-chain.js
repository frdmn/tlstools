#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var cmdr = require('commander'),
    helper = require('./helper');

/* Logic */

// Setup sub command options
cmdr
  .option('-i, --input-file [file]', 'input file that contains certificate')
  .option('-h, --hostname [host]', 'hostname to check')
  .parse(process.argv);

// Declare variables
var haystack;

if(cmdr.hostname){
  helper.resolveDns(cmdr.hostname, function(ip){
    helper.sslDecoderApi(cmdr.hostname, ip, "443", function(response){
      if (response.data) {
        haystack = response.data.chain['1'].key.certificate_pem;
        helper.attemptToFixChain(haystack, function(repairResponse){
          if (repairResponse !== false) {
            console.log(repairResponse);
            helper.success('Successfully fixed intermediate chain for "' + cmdr.hostname + '".');
            helper.quit(0);
          }
        });
      } else {
        helper.error('Couldn\'t extract certificate for "' + cmdr.hostname + '".');
      }
    });
  });
} else {
  // If "--input-file" is set
  if (cmdr.inputFile) {
    haystack = helper.getFileContent(cmdr.inputFile);
    helper.attemptToFixChain(haystack, function(repairResponse){
      if (repairResponse !== false) {
        console.log(repairResponse);
        helper.success('Successfully fixed intermediate from file "' + cmdr.inputFile + '" chain.');
        helper.quit(0);
      } else {
        helper.error('Couldn\'t extract certificate from file "' + cmdr.inputFile + '".');
      }
    });
  // If "--input-file" is set
  } else {
    haystack = helper.getClipboard();
    helper.attemptToFixChain(haystack, function(repairResponse){
      if (repairResponse !== false) {
        console.log(repairResponse);
        helper.success('Successfully fixed intermediate chain from clipboard.');
        helper.quit(0);
      } else {
        helper.error('Couldn\'t extract certificate from clipboard.');
      }
    });
  }
}

typeof console;
