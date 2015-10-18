/* jshint node: true */
'use strict';

var spawn = require('child_process').spawn;

module.exports = {
  getCertificateInfo: function (cert, cb) {
    var infoObject = {},
        issuerElements = [],
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['x509', '-noout', '-issuer', '-subject', '-dates']);
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
  		cb(err, infoObject);
  	});
  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  },

  getCertificateRequestInfo: function (cert, cb) {
    var infoObject = {},
        subjectElements = [],
        err;

  	var openssl = spawn('openssl', ['req', '-noout', '-subject']);
  	openssl.stdout.on('data', function (out) {
      var data = out.toString();

      // Put each line into an array
      var lineArray = data.split('\n');


      // Filter out empty ones
      lineArray = lineArray.filter(function(n){ return n !== undefined && n !== '' });

      // Check if output is exact four lines
      if (lineArray.length !== 1) {
        err = new Error('Couldn\'t read certificate');
      }

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
  		cb(err, infoObject);
  	});
  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  }
};
