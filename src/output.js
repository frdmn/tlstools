/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import pc from 'picocolors';

/**
 * Print a message to stdout.
 * @param {string} msg
 */
export function out(msg) {
  console.log(msg);
}

/**
 * Print a success indicator and message.
 * Status messages go to stderr so stdout stays pipeable,
 * e.g. `tls chain -H example.com > bundle.pem`.
 * @param {string} msg
 */
export function success(msg) {
  console.error(`${pc.bold(pc.green(' ✔ '))}${msg}`);
}

/**
 * Print an error indicator and message to stderr.
 * @param {string} msg
 */
export function error(msg) {
  console.error(`${pc.bold(pc.red(' ✖ '))}${msg}`);
}

/**
 * Print an error message and exit with the given code.
 * @param {string} msg
 * @param {number} [code=1]
 */
export function die(msg, code = 1) {
  error(msg);
  process.exit(code);
}
