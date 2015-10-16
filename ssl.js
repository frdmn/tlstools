#!/usr/bin/env node

/*          _ _              _
 *  ___ ___| | |_ ___   ___ | |___
 * / __/ __| | __/ _ \ / _ \| / __|
 * \__ \__ \ | || (_) | (_) | \__ \
 * |___/___/_|\__\___/ \___/|_|___/
 *
 * Copyright (c) 2015 by Jonas Friedmann. This source is
 * subject to the Microsoft Permissive License. Please see
 * the LICENSE file for more information. All Rights Reserved.
 */

var cmdr = require('commander');

// Initiate the commander.js argument setup
cmdr
  .version('1.1.0')
  .command('chain', 'attempt to fix incomplete certificate chain')
  .command('crt <hostname> [port]', 'display TLS information for given hostname')
  .command('csr', 'decode certificate request information')
  .parse(process.argv);
