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
if (!inputHostname) {
  helper.die('No hostname given');
}

// Resolve DNS of input hostname
helper.resolveDns(inputHostname, function(inputIp){
  helper.sslDecoderApi(inputHostname, inputIp, inputPort, function(response){
    // Check if JSON contains expected certificate data
    if (typeof response.data === 'undefined') {
      helper.die('Couldn\'t get certificate of ' + inputHostname + ':' + inputPort);
    }

    helper.success('Successfully parsed information:');

    // Store particular info
    var jsonCrt = response.data.chain['1'].key.certificate_pem,
        jsonStartDate = response.data.chain['1'].cert_data.validFrom_time_t,
        jsonEndDate = response.data.chain['1'].cert_data.validTo_time_t;

    var realStartDate = new Date(jsonStartDate * 1000),
        realEndDate = new Date(jsonEndDate * 1000),
        realRemainingDays = Math.round(Math.abs((realStartDate.getTime() - realEndDate.getTime())/(24*60*60*1000))); /* via http://www.vijayjoshi.org/2008/10/24/faq-calculate-number-of-days-between-two-dates-in-javascript/ */

    // Only show the CRT if "--only-info" is _NOT_ passed
    if (!cmdr.onlyInfo) {
      console.log(jsonCrt);
    }

    // Only show certificate information if "--only-cert" is _NOT_ passed
    if (!cmdr.onlyCert) {
      console.log('Host/port: ' + inputHostname + ':' + inputPort);
      console.log('Start date: ' + realStartDate);
      console.log('End date: ' + realEndDate);
      console.log('Remaining days: ' + realRemainingDays);
    }

    // Exit successfully
    helper.quit(0);
  });
});
