/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var colors = require('colors'),
    request = require('request'),
    dns = require('dns');

module.exports = {
  /**
   * Return success indicator and message
   * @param  {string} message to return
   */
  success: function (msg) {
    console.log(' ✔ '.bold.green + msg);
  },

  /**
   * Return error indicator and message
   * @param  {string} message to return
   */
  error: function (msg) {
    console.error(' ✖ '.bold.red + msg);
  },

  /**
   *
   */
   quit: function (code) {
     process.exit(code);
   },

  /**
   * Let script die by returning error exit code as well as
   * error message by executing error()
   * @param  {string} message to return
   */
  die: function (msg) {
    // Call function from above to print error message
    module.exports.error(msg);
    process.exit(1);
  },

  /**
   * Resolve an DNS hostname to it's actual IP address
   * @param  {string}      input hostname
   * @param  {function}    callback
   * @return {string|BOOL}
   */
  resolveDns: function(hostname, cb){
    dns.resolve4(hostname, function (err, addresses) {
      // Catch possible errors
      if (err){
        return cb(false);
      }

      if (typeof addresses !== 'undefined' && addresses.length > 0) {
        // If more than one host in response, only return the first
        if (addresses.length >= 1) {
          return cb(addresses[0]);
        } else {
          return cb(addresses);
        }
      } else {
        return cb(false);
      }
    });
  },

  /**
   * Call SSLdecoder.org easily via JSON API
   * @param  {string}      input hostname
   * @param  {string}      input IP
   * @param  {string}      input port
   * @param  {Function}    callback
   * @return {string|BOOL}
   */
  sslDecoderApi: function(hostname, ip, port, cb){
    var url = 'https://ssldecoder.org/json.php?host=' + hostname + ':' + ip + '&port=' + port + '&ciphersuites=0';

    request(url, function (error, response, body) {
      if (error){
        return cb(false);
      }

      if (response.statusCode == 200) {
        return cb(JSON.parse(body));
      } else {
        return cb(error);
      }
    });
  }
};
