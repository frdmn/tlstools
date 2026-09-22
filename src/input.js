/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { readFile } from 'node:fs/promises';
import clipboard from 'clipboardy';
import openssl from 'openssl-cert-tools';

const DEFAULT_PORT = 443;

/**
 * Parse a "host[:port]" option value into a host and numeric port.
 * Supports bracketed IPv6 addresses like "[::1]:8443"; a bare IPv6
 * address (multiple colons, no brackets) is treated as host-only.
 * @param {string} value
 * @returns {{ host: string, port: number }}
 */
export function parseHostOption(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Host must be a non-empty string');
  }

  let host = value;
  let port = DEFAULT_PORT;

  const bracketed = value.match(/^\[(.+)\](?::(\d+))?$/);
  if (bracketed) {
    host = bracketed[1];
    if (bracketed[2] !== undefined) {
      port = Number(bracketed[2]);
    }
  } else {
    const lastColon = value.lastIndexOf(':');
    if (lastColon !== -1 && value.indexOf(':') === lastColon) {
      host = value.slice(0, lastColon);
      port = Number(value.slice(lastColon + 1));
    }
  }

  if (host.length === 0) {
    throw new Error(`Invalid hostname "${value}"`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port "${port}", must be an integer between 1 and 65535`);
  }

  return { host, port };
}

/**
 * Merge the positional hostname argument and the -H/--hostname flag
 * into one value. Throws when both are provided.
 * @param {object} options commander options object
 * @param {string} [positional] positional hostname argument
 * @returns {string|undefined}
 */
export function resolveHostname(options, positional) {
  if (options.hostname && positional) {
    throw new Error('Conflicting hostname arguments: pass either a positional hostname or -H/--hostname, not both');
  }
  return options.hostname ?? positional;
}

/**
 * Read a file, with a friendly error when it does not exist.
 * @param {string} file
 * @returns {Promise<string>}
 */
export async function readFileContent(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`File "${file}" does not exist`, { cause: err });
    }
    throw err;
  }
}

/**
 * Extract the first PEM certificate block from a string.
 * @param {string} text
 * @returns {string|null}
 */
export function extractCertificate(text) {
  const match = text.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
  return match ? match[0] : null;
}

/**
 * Extract the first PEM certificate request (CSR) block from a string.
 * Handles both "CERTIFICATE REQUEST" and "NEW CERTIFICATE REQUEST" markers.
 * @param {string} text
 * @returns {string|null}
 */
export function extractCertificateRequest(text) {
  const match = text.match(/-----BEGIN (?:NEW )?CERTIFICATE REQUEST-----[\s\S]*?-----END (?:NEW )?CERTIFICATE REQUEST-----/);
  return match ? match[0] : null;
}

/**
 * Validate that exactly one of the given input sources is set.
 * @param {object} sources
 * @param {string} label description of the expected input, for error messages
 */
function assertSingleSource({ hostname, filename, clipboard }, label) {
  const provided = [hostname, filename, clipboard].filter(Boolean);

  if (provided.length === 0) {
    throw new Error(`No input specified: pass ${label}`);
  }
  if (provided.length > 1) {
    throw new Error('Multiple input sources specified: use only one of hostname, -f/--filename or -c/--clipboard');
  }
}

/**
 * Obtain a single leaf certificate (PEM) from whichever input source
 * is configured: remote hostname, local file or clipboard.
 * @param {object} input
 * @param {string} [input.hostname] remote "host[:port]"
 * @param {string} [input.filename] path to a local certificate file
 * @param {boolean} [input.clipboard] read the certificate from the clipboard
 * @returns {Promise<string>} PEM encoded certificate
 */
export async function obtainCertificate({ hostname, filename, clipboard: fromClipboard }) {
  assertSingleSource({ hostname, filename, clipboard: fromClipboard }, 'a hostname, -f/--filename or -c/--clipboard');

  if (hostname) {
    const { host, port } = parseHostOption(hostname);
    try {
      return await openssl.getCertificate(host, port);
    } catch (err) {
      throw new Error(`Couldn't get certificate of ${host}:${port}: ${err.message}`, { cause: err });
    }
  }

  const content = filename ? await readFileContent(filename) : await clipboard.read();
  const certificate = extractCertificate(content);
  if (!certificate) {
    throw new Error(`No certificate found in ${filename ? `file "${filename}"` : 'clipboard content'}`);
  }
  return certificate;
}

/**
 * Obtain a certificate request (CSR, PEM) from a local file or the clipboard.
 * @param {object} input
 * @param {string} [input.filename] path to a local CSR file
 * @param {boolean} [input.clipboard] read the CSR from the clipboard
 * @returns {Promise<string>} PEM encoded certificate request
 */
export async function obtainCertificateRequest({ filename, clipboard: fromClipboard }) {
  assertSingleSource({ filename, clipboard: fromClipboard }, '-f/--filename or -c/--clipboard');

  const content = filename ? await readFileContent(filename) : await clipboard.read();
  const request = extractCertificateRequest(content);
  if (!request) {
    throw new Error(`No certificate request found in ${filename ? `file "${filename}"` : 'clipboard content'}`);
  }
  return request;
}
