/* jshint node: true */
'use strict';

var spawn = require('child_process').spawn;

module.exports = {
  /**
   * Decodes various information from the provided
   * certificate like issuer, subject, expiration
   * dates.
   * @param  {String|Buffer} cert       Input certificate
   * @param  {Function} cb              Callback
   * @return {Error} err, {Object} info Error and information object
   * @example @return info
   * * {
   * *   certificate: '-----BEGIN CERTIFICATE-----[...]',
   * *   issuer: {
   * *     C: 'US',
   * *     ST: 'State',
   * *     L: 'Location',
   * *     O: 'Organization',
   * *     CN: 'Common Name'
   * *   },
   * *   subject: {
   * *     OU: 'ProductNameSSL',
   * *     CN: 'common.name.com'
   * *   },
   * *   validFrom: Sat Sep 26 2015 02: 00: 00 GMT + 0200(CEST),
   * *   validTo: Thu Dec 31 2015 00: 59: 59 GMT + 0100(CET),
   * *   remainingDays: 96
   * * }
   */
  getCertificateInfo: function (cert, cb) {
    var infoObject = {},
        issuerElements = [],
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['x509', '-noout', '-issuer', '-subject', '-dates']);

    // Catch stderr
    openssl.stderr.on('data', function (out) {
      err = new Error(out);

      // Callback and return array
      return cb(err, infoObject);
    });

  	openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Put each line into an array
      var lineArray = data.split('\n');
      // Filter out empty ones
      lineArray = lineArray.filter(function(n){ return n !== undefined && n !== '' });

      // Check if output is exact four lines
      if (lineArray.length !== 4) {
        err = new Error('Couldn\'t read certificate');
      }

      /* Construct infoObject */

      // Certificate
      infoObject.certificate = cert;

      // Issuer
      infoObject.issuer = {};
      // Split by "/" prefix
      issuerElements = lineArray[0].split('/');
      // ... and get rid of first array element
      issuerElements.shift();
      // For each elements
      for (var iI = 0; iI < issuerElements.length; iI++) {
        // Split keys and values by "=" separator
        var issuerKeyValue = issuerElements[iI].split('=');
        infoObject.issuer[issuerKeyValue[0]] = issuerKeyValue[1];
      }

      // Subject
      infoObject.subject = {};
      // Split by "/" prefix
      subjectElements = lineArray[1].split('/');
      // ... and get rid of first array element
      subjectElements.shift();
      // For each elements
      for (var iS = 0; iS < subjectElements.length; iS++) {
        // Split keys and values by "=" separator
        var subjectKeyValue = subjectElements[iS].split('=');
        infoObject.subject[subjectKeyValue[0]] = subjectKeyValue[1];
      }

      // Dates
      infoObject.validFrom = new Date(lineArray[2].split('=')[1]);
      infoObject.validTo = new Date(lineArray[3].split('=')[1]);
      infoObject.remainingDays = Math.round(Math.abs((infoObject.validFrom.getTime() - infoObject.validTo.getTime())/(24*60*60*1000))); /* via http://www.vijayjoshi.org/2008/10/24/faq-calculate-number-of-days-between-two-dates-in-javascript/ */

      // Callback and return array
  		return cb(err, infoObject);
  	});
  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  },

  /**
   * Decodes information from the provided certificate
   * sign request.
   * @param  {String|Buffer} cert       Input certificate
   * @param  {Function} cb              Callback
   * @return {Error} err, {Object} info Error and information object
   * @example @return info
   * * {
   * *   certificate: '-----BEGIN NEW CERTIFICATE REQUEST-----[...]',
   * *   subject: {
   * *     C: 'DE',
   * *     ST: 'State',
   * *     L: 'Location',
   * *     O: 'Organization',
   * *     OU: 'Organization Unit',
   * *     CN: 'common.name.com'
   * *   }
   * * }
   */
  getCertificateRequestInfo: function (cert, cb) {
    var infoObject = {},
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['req', '-noout', '-subject']);

    // Catch stderr
    openssl.stderr.on('data', function (out) {
      err = new Error(out);

      // Callback and return array
  		return cb(err, infoObject);
    });

    openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Put each line into an array
      var lineArray = data.split('\n');

      // Filter out empty ones
      lineArray = lineArray.filter(function(n){ return n !== undefined && n !== '' });

      /* Construct infoObject */

      // Certificate
      infoObject.certificate = cert;

      // Subject
      infoObject.subject = {};
      // Split by "/" prefix
      subjectElements = lineArray[0].split('/');
      // ... and get rid of first array element
      subjectElements.shift();
      // For each elements
      for (var iS = 0; iS < subjectElements.length; iS++) {
        // Split keys and values by "=" separator
        var subjectKeyValue = subjectElements[iS].split('=');
        infoObject.subject[subjectKeyValue[0]] = subjectKeyValue[1];
      }

      // Callback and return array
  		return cb(err, infoObject);
  	});

  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  }
};