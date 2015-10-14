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
  .option('-c, --only-cert', 'display only the certificate')
  .option('-i, --only-info', 'display only the CRT information')
  .parse(process.argv);

// Remaining args are actual hostnames
var inputHostname = cmdr.args[0];
var inputPort = cmdr.args[1] ? cmdr.args[1] : '443'; // Fallback to default SSL port

// If no first argument, no hostname given => die
if (!inputHostname.length) {
  helper.die('No hostname given');
}

// Resolve DNS of input hostname
helper.resolveDns(inputHostname, function(inputIp){
  helper.sslDecoderApi(inputHostname, inputIp, inputPort, function(data){
    console.log(data);
  });
});
