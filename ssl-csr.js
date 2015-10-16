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
      helpers.decodeCsrInformations(haystack, function(decodeResponse){
        if (decodeResponse !== false) {
          helpers.success('Successfully decoded information from file "' + fileName + '".');
          helpers.quit(0);
        } else {
          helpers.error('Couldn\'t decoded information from file "' + fileName + '".');
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
  helpers.decodeCsrInformations(haystack, function(decodeResponse){
    if (decodeResponse !== false) {
      helpers.success('Successfully decoded information from clipboard.');
      helpers.quit(0);
    } else {
      helpers.error('Couldn\'t decode information from clipboard.');
      helpers.quit(1);
    }
  });
} else {
  helpers.error('No option passed');
  cmdr.help();
}
