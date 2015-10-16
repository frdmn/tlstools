/*
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All rights reserved.
 */

var colors = require('colors'),
    clipboard = require('copy-paste'),
    fs = require('fs'),
    sh = require('shelljs'),
    path = require('path'),
    request = require('request'),
    dns = require('dns');

module.exports = {
  /**
   * Return success indicator and message
   * @param  {string} message to return
   * @return {bool} true
   */
  success: function (msg) {
    console.log(' ✔ '.bold.green + msg);
    return true;
  },

  /**
   * Return error indicator and message
   * @param  {string} message to return
   * @return {bool} true
   */
  error: function (msg) {
    console.error(' ✖ '.bold.red + msg);
    return true;
  },

  /**
   * Quit runtime and return error code
   * @param {integer} error code
   * @return {bool} true
   */
   quit: function (code) {
     process.exit(code);
     return true;
   },

  /**
   * Let script die by returning error exit code as well as
   * error message by executing error()
   * @param  {string} message to return
   * @return {bool} true
   */
  die: function (msg) {
    // Call function from above to print error message
    module.exports.error(msg);
    process.exit(1);
    return true;
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
  },

  /**
   * Access OS clipboard synchronously and return content
   * @return {string}
   */
  getClipboard: function(){
    return clipboard.paste();
  },

  /**
   * Load content of file synchronously
   * @param  {string} filename (incl. path) to load
   * @return {string} content of fileå
   */
  getFileContent: function(file){
    return fs.readFileSync(file, 'utf8');
  },

  /**
   * Load content of file synchronously
   * @param  {string} filename (incl. path) to load
   * @return {string} content of file
   */
  writeFileContent: function(file, content){
    return fs.writeFileSync(file, content, 'utf8');
  },

  /**
   * Tries to fix an certificate which can be passed
   * via the 'haystack' parameter. In case of successful
   * extraction, it returns the fixed intermediate chain
   * orwise it'll return 'false'.
   * @param  {string} haystack
   * @param  {function} cb
   * @return {string|BOOL} result
   */
  attemptToFixChain: function (haystack, cb){
    var libPath = path.join(__dirname, 'lib'),
        resolveChainLib = path.join(libPath, 'cert-chain-resolver.sh');

    // Try to search and extract certificate
    var regexMatcher = haystack.match(/-----BEGIN CERTIFICATE-----((.|\n)*?)-----END CERTIFICATE-----/g);

    // Abort if not a single one found
    if (!regexMatcher || !regexMatcher[0]){
      return cb(false);
    }

    var foundCrt = regexMatcher[0];

    // Create temporary file and write CRT into it
    var tmpFileName = sh.exec('mktemp /tmp/ssltools-chain-XXXXXX', { silent: true }).output.trim();
    module.exports.writeFileContent(tmpFileName, foundCrt);

    // Attempt to fix certificate chain using "cert-chain-resolver.sh"
    sh.exec(resolveChainLib + ' -i -o ' + tmpFileName + '.fixed ' + tmpFileName, { silent: true }, function(code, output) {
      var response = module.exports.getFileContent(tmpFileName + '.fixed');
      // Get rid of temporary files
      sh.exec('rm ' + tmpFileName + '*', { silent: true });
      return cb(response);
    });
  }
};
