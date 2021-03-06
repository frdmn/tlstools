#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var cmdr = require('commander'),
    helpers = require('./lib/helper'),
    openssl = require('openssl-cert-tools');

/* Logic */

// Setup sub command options
cmdr
  .option('-f, --filename <file>', 'search CRT or CSR in file')
  .option('-c, --clipboard', 'search CSR in clipboard')
  .parse(process.argv);

// Declare variables
var haystack;

// If "--filename" is set
if (cmdr.filename) {
  var fileName = cmdr.filename;
  helpers.checkIfFileExists(fileName, function(exists){
    if (exists){
      haystack = helpers.getFileContent(fileName);
      helpers.searchForCertificateRequest(haystack, function(searchResult){
        if (searchResult !== false) {
          // Call displayCrtInformation()
          helpers.displayCsrInformation(searchResult, function(data){
            helpers.quit(0);
          });
        } else {
          helpers.die('Couldn\'t certificate request in file "' + fileName + '"');
        }
      });
    } else {
      helpers.die('Couldn\'t access file "' + fileName + '"');
    }
  });
// otherwise check clipboard...
} else if (cmdr.clipboard) {
  haystack = helpers.getClipboard();
  helpers.searchForCertificateRequest(haystack, function(searchResult){
    if (searchResult !== false) {
      // Call displayCrtInformation()
      helpers.displayCsrInformation(searchResult, function(data){
        helpers.quit(0);
      });
    } else {
      helpers.die('Couldn\'t find certificate request in clipboard');
    }
  });
} else {
  helpers.error('No option passed');
  cmdr.help();
}
