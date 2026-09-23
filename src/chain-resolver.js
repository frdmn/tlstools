/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 *
 * Native reimplementation of AIA certificate chain resolution,
 * inspired by @zakjan's cert-chain-resolver.
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import openssl from 'openssl-cert-tools';
import { extractCertificate } from './input.js';

const MAX_CHAIN_LENGTH = 10;
const DEFAULT_FETCH_TIMEOUT = 10000;

/**
 * Run the openssl binary with the given arguments, piping input to stdin.
 * @param {string[]} args
 * @param {string|Buffer} [input]
 * @returns {Promise<string>} stdout
 */
function runOpenSSL(args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn('openssl', args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });
    child.stderr.on('data', (data) => {
      stderr += data;
    });
    child.on('error', (err) => {
      reject(err.code === 'ENOENT' ? new Error('openssl binary not found in $PATH') : err);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`openssl ${args.join(' ')} failed with exit code ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(stdout);
    });

    // Ignore EPIPE in case openssl exits before consuming all input
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

/**
 * Extract the "CA Issuers" distribution point URI from a certificate's
 * Authority Information Access extension, if present.
 * @param {string} certificate PEM encoded certificate
 * @returns {Promise<string|null>}
 */
export async function getAiaIssuersUri(certificate) {
  const text = await runOpenSSL(['x509', '-noout', '-text'], certificate);
  const match = text.match(/CA Issuers\s*-\s*URI:(\S+)/i);
  return match ? match[1] : null;
}

/**
 * Convert a DER encoded certificate buffer to PEM.
 * @param {Buffer} der
 * @returns {string}
 */
export function derToPem(der) {
  const base64 = der.toString('base64');
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----\n`;
}

/**
 * Return the normalized base64 body of a PEM certificate, for
 * whitespace- and formatting-insensitive comparisons.
 * @param {string} pem
 * @returns {string}
 */
export function certBody(pem) {
  return pem.replace(/-----(?:BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, '');
}

/**
 * Stable identity of the certificate authority a certificate represents:
 * SHA-256 over the subject public key and the subject DN. Cross-signed
 * variants of the same CA certificate (identical key and subject,
 * different issuer) share this identity, unlike a byte-level DER
 * comparison — chain completeness must be judged by it, since servers
 * may serve a different cross-signing than their AIA points distribute
 * (e.g. Google's WE1 intermediate).
 * @param {string} pem PEM encoded certificate
 * @returns {Promise<string>} hex digest
 */
export async function certIdentity(pem) {
  const pubkey = await runOpenSSL(['x509', '-noout', '-pubkey'], pem);
  const { subject } = await openssl.getCertificateInfo(pem);
  const spki = pubkey.replace(/-----(?:BEGIN|END) [A-Z ]+-----/g, '').replace(/\s+/g, '');
  return createHash('sha256').update(`${spki}\n${JSON.stringify(Object.entries(subject))}`).digest('hex');
}

/**
 * Detect a DER encoded PKCS#7 bundle. A certificate's DER starts with
 * SEQUENCE followed by the [0] version tag (0xA0), while PKCS#7 starts
 * with SEQUENCE followed by a contentType OID tag (0x06).
 * @param {Buffer} body
 * @param {string|null} contentType HTTP Content-Type header
 * @returns {boolean}
 */
function isPkcs7(body, contentType) {
  if (contentType && /pkcs7/i.test(contentType)) {
    return true;
  }
  return body.length > 4 && body[4] === 0x06;
}

/**
 * Parse a certificate out of an AIA "CA Issuers" response body, which is
 * usually raw DER, sometimes a PKCS#7 bundle (DER or PEM) and sometimes
 * a plain PEM certificate.
 * @param {Buffer} body
 * @param {string|null} contentType HTTP Content-Type header
 * @returns {Promise<string>} PEM encoded certificate
 */
export async function parseIssuerCertificate(body, contentType) {
  const text = body.toString('utf8');

  if (text.includes('-----BEGIN CERTIFICATE-----')) {
    return extractCertificate(text);
  }
  if (text.includes('-----BEGIN PKCS7-----')) {
    return extractCertificate(await runOpenSSL(['pkcs7', '-print_certs'], text));
  }
  if (isPkcs7(body, contentType)) {
    return extractCertificate(await runOpenSSL(['pkcs7', '-inform', 'DER', '-print_certs'], body));
  }

  // Anything else must be a DER certificate: SEQUENCE (0x30) as first
  // non-whitespace byte. Rejects HTML or XML error pages up front.
  const firstByte = body.find((byte) => byte !== 0x09 && byte !== 0x0a && byte !== 0x0d && byte !== 0x20);
  if (firstByte !== 0x30) {
    throw new Error(`Response is not a certificate (content-type: ${contentType ?? 'unknown'})`);
  }
  return derToPem(body);
}

/**
 * Fetch an issuer certificate from an AIA "CA Issuers" URI.
 * The distribution point usually serves DER, sometimes PKCS#7 or PEM.
 * @param {string} uri
 * @param {number} [timeout] fetch timeout in milliseconds
 * @returns {Promise<string>} PEM encoded certificate
 */
async function fetchIssuerCertificate(uri, timeout = DEFAULT_FETCH_TIMEOUT) {
  const response = await fetch(uri, { signal: AbortSignal.timeout(timeout), redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to fetch issuer certificate from "${uri}" (HTTP ${response.status})`);
  }

  try {
    return await parseIssuerCertificate(Buffer.from(await response.arrayBuffer()), response.headers.get('content-type'));
  } catch (err) {
    throw new Error(`Couldn't parse issuer certificate from "${uri}": ${err.message}`, { cause: err });
  }
}

/**
 * Compare a certificate's issuer and subject distinguished names
 * to detect a self-signed (root) certificate.
 * @param {object} info result of openssl-cert-tools getCertificateInfo
 * @returns {boolean}
 */
function isSelfSigned(info) {
  const normalized = (dn) => JSON.stringify(Object.keys(dn).sort().map((key) => [key, dn[key]]));
  return normalized(info.issuer) === normalized(info.subject);
}

/**
 * Resolve the certificate chain for a leaf certificate by following
 * AIA "CA Issuers" URIs until a self-signed root is reached.
 * The root itself is excluded from the result, so callers get the
 * chain they should serve: leaf first, then all intermediates.
 * @param {string} leafPem PEM encoded leaf certificate
 * @param {object} [options]
 * @param {number} [options.timeout] fetch timeout in milliseconds
 * @returns {Promise<string[]>} array of PEM encoded certificates
 */
export async function resolveChain(leafPem, { timeout } = {}) {
  const chain = [leafPem];
  const seen = new Set([certBody(leafPem)]);

  while (chain.length < MAX_CHAIN_LENGTH) {
    const current = chain[chain.length - 1];
    const info = await openssl.getCertificateInfo(current);

    if (isSelfSigned(info)) {
      // A self-signed certificate at the end of the chain is a fetched root
      // and is excluded; a self-signed leaf simply has nothing to resolve.
      if (chain.length > 1) {
        chain.pop();
      }
      break;
    }

    const issuerUri = await getAiaIssuersUri(current);
    if (!issuerUri) {
      break;
    }
    if (!/^https?:/i.test(issuerUri)) {
      // Only HTTP(S) distribution points can be fetched
      break;
    }

    const issuerPem = await fetchIssuerCertificate(issuerUri, timeout);
    const body = certBody(issuerPem);
    if (seen.has(body)) {
      break;
    }

    seen.add(body);
    chain.push(issuerPem);
  }

  return chain;
}
