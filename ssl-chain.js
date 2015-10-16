#!/usr/bin/env node

/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var cmdr = require('commander'),
    path = require('path'),
    fs = require('fs'),
    sh = require('shelljs'),
    helper = require('./helper');

var libPath = path.join(__dirname, 'lib'),
    resolveChainLib = path.join(libPath, 'cert-chain-resolver.sh');

/* Logic */

// Setup sub command options
cmdr
  .option('-i, --input-file [file]', 'input file that contains certificate')
  // .option('-h, --hostname', 'hostname to check')
  .parse(process.argv);

// Declare variables
var haystack;

// If "--input-file" is set
if (cmdr.inputFile) {
  haystack = helper.getFileContent(cmdr.inputFile);
} else {
  haystack = helper.getClipboard();
}

// Try to search and extract certificate
var regexMatcher = haystack.match(/-----BEGIN CERTIFICATE-----((.|\n)*?)-----END CERTIFICATE-----/g);

// Abort if not a single one found
if (!regexMatcher || !regexMatcher[0]){
  helper.die('Couldn\'t extract certificate');
}

var foundCrt = regexMatcher[0];

// Create temporary file and write CRT into it
var tmpFileName = sh.exec('mktemp /tmp/ssltools-chain-XXXXXX', { silent: true }).output.trim();
helper.writeFileContent(tmpFileName, foundCrt);

// Attempt to fix certificate chain using "cert-chain-resolver.sh"
sh.exec(resolveChainLib + ' -i -o ' + tmpFileName + '.fixed ' + tmpFileName, { silent: true }, function(code, output) {
  helper.success("Successfully fixed intermediate chain:");
  console.log(helper.getFileContent(tmpFileName + '.fixed'));
});

// Get rid of temporary files
sh.exec('rm ' + tmpFileName + '*', { silent: true });
