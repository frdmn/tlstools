#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var cmdr = require('commander'),
    helpers = require('./lib/helper'),
    openssl = require('openssl-cert-tools');

/* Functions */

/**
* Display decoded certificate information to stdout
* @param  {String}      certificate
* @param  {Function}    callback
* @return {String|Bool} result
*/
var displayCrtInformation = function (cert, cb){
  openssl.getCertificateInfo(cert, function(err, data){
    if (err === undefined) {
      // Print out info
      helpers.out('Certificate Request:'.bold);
      helpers.out(data.certificate);
      helpers.out('Issuer:'.bold);

      // For each issuer element
      for(var issuerElement in data.issuer){
        helpers.out(' - ' + issuerElement + ': ' + data.issuer[issuerElement]);
      }

      helpers.out('Subject:'.bold);

      // For each subject element
      for(var subjectElement in data.subject){
        helpers.out(' - ' + subjectElement + ': ' + data.subject[subjectElement]);
      }

      helpers.out('Valid from:'.bold + ' ' + data.validFrom);
      helpers.out('Valid to:'.bold + ' ' + data.validTo);
      helpers.out('Remaining days:'.bold + ' ' + data.remainingDays);

      return cb(true);
    } else {
      // console.log(err.message);
      return cb(false);
    }
  });
}

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
      // Check if JSON contains expected certificate data
      if (typeof response.data === 'undefined') {
        helpers.die('Couldn\'t get certificate of ' + hostName + ':' + hostPort);
      }

      // Store particular info
      /* jshint -W106 */
      var jsonCrt = response.data.chain['1'].key.certificate_pem;

      // Call displayCrtInformation()
      displayCrtInformation(jsonCrt, function(data){
        helpers.quit(0);
      });
    });
  });
// If "--input-file" is set
} else if (cmdr.filename) {
  var fileName = cmdr.filename;
  helpers.checkIfFileExists(fileName, function(exists){
    if (exists){
      haystack = helpers.getFileContent(fileName);

      // Search for certificate in haystack
      helpers.searchForCertificate(haystack, function(searchResult){
        // Check for false search result
        if (searchResult === false){
          helpers.die('Couldn\'t extract certificate from file "' + fileName + '"');
        }

        // Call displayCrtInformation()
        displayCrtInformation(searchResult, function(data){
          helpers.quit(0);
        });
      });
    } else {
      helpers.die('Couldn\'t access file "' + fileName + '"');
    }
  });
// otherwise check clipboard...
} else if (cmdr.clipboard) {
  // Load clipboard content
  haystack = helpers.getClipboard();

  // Search for certificate in haystack
  helpers.searchForCertificate(haystack, function(searchResult){
    // Check for false search result
    if (searchResult === false){
      helpers.die('Couldn\'t extract certificate from clipboard');
    }

    // Call displayCrtInformation()
    displayCrtInformation(searchResult, function(data){
      helpers.quit(0);
    });
  });
} else {
  helpers.error('No option passed');
  cmdr.help();
}
