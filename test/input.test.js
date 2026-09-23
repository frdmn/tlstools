import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  parseHostOption,
  resolveHostname,
  extractCertificate,
  extractCertificateRequest,
  obtainCertificate
} from '../src/input.js';
import { fixturePath } from './helpers.js';

test('parseHostOption defaults the port to 443', () => {
  assert.deepEqual(parseHostOption('frd.mn'), { host: 'frd.mn', port: 443 });
});

test('parseHostOption splits host and port', () => {
  assert.deepEqual(parseHostOption('frd.mn:8443'), { host: 'frd.mn', port: 8443 });
});

test('parseHostOption handles bracketed IPv6 with port', () => {
  assert.deepEqual(parseHostOption('[::1]:8443'), { host: '::1', port: 8443 });
});

test('parseHostOption treats a bare IPv6 address as host-only', () => {
  assert.deepEqual(parseHostOption('::1'), { host: '::1', port: 443 });
});

test('parseHostOption rejects invalid input', () => {
  for (const value of ['', 'frd.mn:', 'frd.mn:0', 'frd.mn:99999', 'frd.mn:abc', ':443']) {
    assert.throws(() => parseHostOption(value), Error, `expected "${value}" to be rejected`);
  }
});

test('resolveHostname prefers the flag and rejects conflicts', () => {
  assert.equal(resolveHostname({ hostname: 'a.com' }, undefined), 'a.com');
  assert.equal(resolveHostname({ hostname: undefined }, 'b.com'), 'b.com');
  assert.throws(() => resolveHostname({ hostname: 'a.com' }, 'b.com'), /Conflicting hostname/);
});

test('extractCertificate finds the first PEM block in noise', () => {
  const haystack = `some header\n-----BEGIN CERTIFICATE-----\nabc==\n-----END CERTIFICATE-----\ntail`;
  assert.equal(extractCertificate(haystack), '-----BEGIN CERTIFICATE-----\nabc==\n-----END CERTIFICATE-----');
});

test('extractCertificate returns null without a match', () => {
  assert.equal(extractCertificate('no cert here'), null);
});

test('extractCertificateRequest handles plain and NEW markers', () => {
  assert.equal(
    extractCertificateRequest('-----BEGIN CERTIFICATE REQUEST-----\nabc\n-----END CERTIFICATE REQUEST-----'),
    '-----BEGIN CERTIFICATE REQUEST-----\nabc\n-----END CERTIFICATE REQUEST-----'
  );
  assert.equal(
    extractCertificateRequest('-----BEGIN NEW CERTIFICATE REQUEST-----\nabc\n-----END NEW CERTIFICATE REQUEST-----'),
    '-----BEGIN NEW CERTIFICATE REQUEST-----\nabc\n-----END NEW CERTIFICATE REQUEST-----'
  );
  assert.equal(extractCertificateRequest('nothing'), null);
});

test('obtainCertificate reads a certificate from a file', async () => {
  const expected = (await readFile(fixturePath('leaf.pem'), 'utf8')).trim();
  const certificate = await obtainCertificate({ filename: fixturePath('leaf.pem') });
  assert.equal(certificate.trim(), expected);
});

test('obtainCertificate rejects a file without a certificate', async () => {
  await assert.rejects(obtainCertificate({ filename: fixturePath('csr.pem') }), /No certificate found/);
});

test('obtainCertificate requires exactly one input source', async () => {
  await assert.rejects(obtainCertificate({}), /No input specified/);
  await assert.rejects(
    obtainCertificate({ filename: 'a.pem', clipboard: true }),
    /Multiple input sources/
  );
});
