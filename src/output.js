/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import pc from 'picocolors';

/**
 * Print a message to stdout; called without arguments, prints a blank line.
 * @param {string} [msg]
 */
export function out(msg = '') {
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
 * Print a neutral notice indicator and message to stderr,
 * preceded by a blank line to separate it from stdout data.
 * @param {string} msg
 */
export function notice(msg) {
  console.error('');
  console.error(`${pc.bold(pc.cyan(' ℹ '))}${msg}`);
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

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerInterval = null;

/**
 * Run an async function while showing a spinner on stderr, cleared
 * before anything else prints. Automatically omitted when stderr is
 * not an interactive terminal, so piped and scripted output stays
 * untouched.
 * @param {string} msg task description
 * @param {() => Promise} fn
 */
export async function withSpinner(msg, fn) {
  if (!process.stderr.isTTY || spinnerInterval) {
    return fn();
  }
  let frame = 0;
  process.stderr.write(`${pc.cyan(SPINNER_FRAMES[frame])} ${msg}`);
  spinnerInterval = setInterval(() => {
    frame = (frame + 1) % SPINNER_FRAMES.length;
    process.stderr.write(`\r${pc.cyan(SPINNER_FRAMES[frame])} ${msg}`);
  }, 80);
  try {
    return await fn();
  } finally {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
    process.stderr.write('\r\x1b[2K');
  }
}

/**
 * Format a date as a human-readable UTC timestamp,
 * e.g. "2026-07-29 22:10:08 UTC".
 * @param {Date} date
 * @returns {string}
 */
export function humanDate(date) {
  return `${date.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

/**
 * Print document-style sections: a muted bold header followed by
 * indented, aligned key/value pairs. Used for per-component
 * distinguished names and the validity dates.
 * @param {Array<[string, Array<[string, string]>]>} groups
 */
export function printSections(groups) {
  const keyWidth = Math.max(...groups.flatMap(([, pairs]) => pairs.map(([key]) => key.length)));
  for (const [header, pairs] of groups) {
    out(`  ${pc.bold(pc.dim(header))}`);
    for (const [key, value] of pairs) {
      out(`    ${pc.dim(key.padEnd(keyWidth))}  ${value}`);
    }
  }
}

/**
 * Color by certificate urgency: red when expired or within a week,
 * yellow within a month, green otherwise.
 * @param {number} days
 * @returns {(text: string) => string}
 */
export function daysColor(days) {
  if (days <= 7) return pc.red;
  if (days <= 30) return pc.yellow;
  return pc.green;
}

const pluralDays = (n) => (Math.abs(n) === 1 ? 'day' : 'days');

/**
 * Print a one-line certificate validity verdict to stderr, colored by
 * urgency (see daysColor). Preceded by a blank line so it closes the
 * stdout report without polluting piped output.
 * @param {string} label hostname, file name or similar identifier
 * @param {number|undefined} expiredDays days since expiry, if expired
 * @param {number} remainingDays days left until expiry
 */
export function verdict(label, expiredDays, remainingDays) {
  console.error('');
  if (expiredDays !== undefined) {
    console.error(`${pc.bold(pc.red(' ✖ '))}${pc.bold(label)} ${pc.red(`certificate expired ${expiredDays} ${pluralDays(expiredDays)} ago`)}`);
    return;
  }
  const color = daysColor(remainingDays);
  const symbol = remainingDays <= 30 ? '⚠' : '✔';
  console.error(`${pc.bold(color(` ${symbol} `))}${pc.bold(label)} ${color(`— valid for another ${remainingDays} ${pluralDays(remainingDays)}`)}`);
}
