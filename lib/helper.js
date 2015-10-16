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
   * Function to print messages to stdout
   * @param  {String} msg
   * @return {Bool}   true
   */
  out: function(msg){
    console.log(msg);
    return true;
  },
  /**
   * Return success indicator and message
   * @param  {String} message to return
   * @return {Bool}   true
   */
  success: function (msg) {
    console.log(' ✔ '.bold.green + msg);
    return true;
  },

  /**
   * Return error indicator and message
   * @param  {String} message to return
   * @return {Bool}   true
   */
  error: function (msg) {
    console.error(' ✖ '.bold.red + msg);
    return true;
  },

  /**
   * Quit runtime and return error code
   * @param {integer} error code
   * @return {Bool}   true
   */
   quit: function (code) {
     process.exit(code);
     return true;
   },

  /**
   * Let script die by returning error exit code as well as
   * error message by executing error()
   * @param  {String} message to return
   * @return {Bool}   true
   */
  die: function (msg) {
    // Call function from above to print error message
    module.exports.error(msg);
    process.exit(1);
    return true;
  },

  /**
   * Resolve an DNS hostname to it's actual IP address
   * @param  {String}      input hostname
   * @param  {Function}    callback
   * @return {String|BOOL}
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
   * @param  {String}      input hostname
   * @param  {String}      input IP
   * @param  {String}      input port
   * @param  {Function}    callback
   * @return {String|BOOL}
   */
  sslDecoderApi: function(hostname, ip, port, cb){
    var url = 'https://ssldecoder.org/json.php?host=' + hostname + ':' + ip + '&port=' + port + '&ciphersuites=0';

    request(url, function (error, response, body) {
      if (error){
        return cb(false);
      }

      if (response.statusCode === 200) {
        return cb(JSON.parse(body));
      } else {
        return cb(error);
      }
    });
  },

  /**
   * Access OS clipboard synchronously and return content
   * @return {String} clipboard content
   */
  getClipboard: function(){
    return clipboard.paste();
  },

  /**
   * Load content of file synchronously
   * @param  {String} filename (incl. path) to load
   * @return {String} content of fileå
   */
  getFileContent: function(file){
    return fs.readFileSync(file, 'utf8');
  },

  /**
   * Load content of file synchronously
   * @param  {String} filename (incl. path) to load
   * @return {String} content of file
   */
  writeFileContent: function(file, content){
    return fs.writeFileSync(file, content, 'utf8');
  },

  /**
   * Tries to fix an certificate which can be passed
   * via the 'haystack' parameter. In case of successful
   * extraction, it returns the fixed intermediate chain
   * orwise it'll return 'false'.
   * @param  {String}      haystack
   * @param  {Function}    cb
   * @return {String|Bool} result
   */
  attemptToFixChain: function (haystack, cb){
    var vendorPath = path.join(__dirname, '..' , 'vendor'),
        certChainResolverShell = path.join(vendorPath, 'cert-chain-resolver.sh');

    // Try to search and extract certificate
    var regexMatcher = haystack.match(/-----BEGIN CERTIFICATE-----((.|\n)*?)-----END CERTIFICATE-----/g);

    // Abort if not a single one found
    if (!regexMatcher || !regexMatcher[0]){
      return cb(false);
    }

    var foundCrt = regexMatcher[0];

    // Create temporary file and write CRT into it
    var tmpFileName = sh.exec('mktemp /tmp/ssltools-XXXXXX', { silent: true }).output.trim();
    module.exports.writeFileContent(tmpFileName, foundCrt);

    // Attempt to fix certificate chain using "cert-chain-resolver.sh"
    sh.exec(certChainResolverShell + ' -i -o ' + tmpFileName + '.fixed ' + tmpFileName, { silent: true }, function(code, output) {
      var response = module.exports.getFileContent(tmpFileName + '.fixed');
      // Get rid of temporary files
      sh.exec('rm ' + tmpFileName + '*', { silent: true });
      return cb(response);
    });
  },

  /**
   * Check if file exists on file system
   * @param  {String}   filename
   * @param  {Function} callback
   * @return {Bool}     result
   */
  checkIfFileExists: function(filename, cb){
    fs.stat(filename, function(err, stat) {
      if(err === null) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  },

  decodeCsrInformations: function(input, cb){
    // Try to search and extract certificate sign request
    var regexMatcher = input.match(/-----BEGIN (NEW )?CERTIFICATE REQUEST-----((.|\n)*?)-----END (NEW )?CERTIFICATE REQUEST-----/g);

    // If there's an certificate sign request ...
    if (regexMatcher && regexMatcher[0]){
      // Create and write to tempfile
      var tmpFileName = sh.exec('mktemp /tmp/ssltools-XXXXXX', { silent: true }).output.trim();
      module.exports.writeFileContent(tmpFileName, regexMatcher[0]);

      // Store informations
      var infoCertificate = sh.exec('cat ' + tmpFileName, { silent: true }).output.trim(),
          infoSubject = sh.exec('openssl req -in ' + tmpFileName + ' -noout -subject', { silent: true }).output.trim(),
          infoKeySize = sh.exec('openssl req -in ' + tmpFileName + ' -noout -text | grep "Public Key:"', { silent: true }).output.trim(),
          parsedInfoArray = [];

      // Split by "/" prefix
      parsedInfoArray = infoSubject.split('/');
      // ... and get rid of first array element
      parsedInfoArray.shift();

      // Print out info
      module.exports.out('Certificate Request:'.bold);
      module.exports.out(infoCertificate);
      module.exports.out('Key size: '.bold + infoKeySize.match(/[0-9]+/g)[0] + ' bit');
      module.exports.out('Subject:'.bold);

      // For each remaining
      for (var k = 0; k < parsedInfoArray.length; k++) {
        // Split keys and values by "=" separator
        var keyValue = parsedInfoArray[k].split('=');
        // Print each key-value pair
        module.exports.out(' - ' + keyValue[0].bold + ': ' + keyValue[1]);
      }

      return cb(true);
    // otherwise return false
    } else {
      return cb(false);
    }
  }
};