/* jshint node: true */
'use strict';

var spawn = require('child_process').spawn;

module.exports = {
  checkCertificateExpiration: function (cert, cb) {
  	var openssl = spawn('openssl', ['x509', '-noout', '-enddate']);
  	openssl.stdout.on('data', function (out) {
  		var data = out.toString().trim();
  		var certExpiry, err;
  		try {
  			certExpiry = new Date(data.split('=')[1]);
  		} catch (_er) {
  			err = _er;
  		}
  		cb(err, certExpiry);
  	});
  	openssl.stdin.write(cert);
  	openssl.stdin.end();
  }
};
