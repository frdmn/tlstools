#!/usr/bin/env node

/*          _ _              _
 *  ___ ___| | |_ ___   ___ | |___
 * / __/ __| | __/ _ \ / _ \| / __|
 * \__ \__ \ | || (_) | (_) | \__ \
 * |___/___/_|\__\___/ \___/|_|___/
 *
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

var cmdr = require('commander'),
    pkg = require('./package.json')
    cmds = [];

// Initiate the commander.js argument setup
cmdr
  .version(pkg.version)
  .command('chain', 'attempt to fix incomplete certificate chain')
  .command('check', 'check remote certificate chain')
  .command('crt', 'display TLS information for given hostname')
  .command('csr', 'decode certificate request information')
  .parse(process.argv);

// Loop through available sub commands
for (var i = 0; i < cmdr.commands.length; i++) {
  cmds.push(cmdr.commands[i]._name);
};

// Check if sub command exist, otherwise show help
if (cmds.indexOf(process.argv.slice(2)[0]) === -1) {
  cmdr.help();
};
