import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  resolveChain,
  getAiaIssuersUri,
  derToPem,
  certBody,
  parseIssuerCertificate
} from '../src/chain-resolver.js';
import { fixturePath } from './helpers.js';

const readFixture = async (name) => readFile(fixturePath(name), 'utf8');

test('derToPem converts DER to a PEM with 64 character lines', async () => {
  const der = await readFile(fixturePath('intermediate.der'));
  const pem = await readFixture('intermediate.pem');

  const converted = derToPem(der);
  assert.match(converted, /-----BEGIN CERTIFICATE-----/);
  assert.equal(certBody(converted), certBody(pem));
});

test('certBody ignores PEM formatting differences', () => {
  const a = '-----BEGIN CERTIFICATE-----\nabc\ndef\n-----END CERTIFICATE-----';
  const b = '-----BEGIN CERTIFICATE-----\nabcdef\n-----END CERTIFICATE-----';
  assert.equal(certBody(a), certBody(b));
});

test('getAiaIssuersUri extracts the CA Issuers URI from a leaf', async () => {
  const leaf = await readFixture('leaf.pem');
  assert.equal(await getAiaIssuersUri(leaf), 'http://127.0.0.1:18473/intermediate.der');
});

test('getAiaIssuersUri returns null without an AIA extension', async () => {
  const root = await readFixture('root.pem');
  assert.equal(await getAiaIssuersUri(root), null);
});

test('parseIssuerCertificate passes PEM responses through', async () => {
  const pem = await readFixture('intermediate.pem');
  const parsed = await parseIssuerCertificate(Buffer.from(pem), 'application/x-pem-file');
  assert.equal(certBody(parsed), certBody(pem));
});

test('parseIssuerCertificate converts DER responses', async () => {
  const der = await readFile(fixturePath('intermediate.der'));
  const pem = await readFixture('intermediate.pem');
  const parsed = await parseIssuerCertificate(der, 'application/pkix-cert');
  assert.equal(certBody(parsed), certBody(pem));
});

test('parseIssuerCertificate unwraps PKCS#7 bundles', async () => {
  const pkcs7 = await readFile(fixturePath('intermediate.p7c'));
  const pem = await readFixture('intermediate.pem');
  const parsed = await parseIssuerCertificate(pkcs7, 'application/pkcs7-mime');
  assert.equal(certBody(parsed), certBody(pem));
});

test('parseIssuerCertificate rejects non-certificate responses', async () => {
  const html = Buffer.from('<html><body>error page</body></html>');
  await assert.rejects(parseIssuerCertificate(html, 'text/html'), /not a certificate/);
});

test('resolveChain returns a self-signed certificate unchanged', async () => {
  const root = await readFixture('root.pem');
  const chain = await resolveChain(root);
  assert.equal(chain.length, 1);
  assert.equal(certBody(chain[0]), certBody(root));
});

test('resolveChain follows AIA URIs to build the intermediate chain', async (t) => {
  const leaf = await readFixture('leaf.pem');
  const intermediate = await readFixture('intermediate.pem');

  t.mock.method(globalThis, 'fetch', async () => new Response(intermediate));

  const chain = await resolveChain(leaf);
  assert.equal(chain.length, 2);
  assert.equal(certBody(chain[0]), certBody(leaf));
  assert.equal(certBody(chain[1]), certBody(intermediate));
});

test('resolveChain stops on circular AIA references', async (t) => {
  const leaf = await readFixture('leaf.pem');

  // The distribution point serves the leaf itself
  t.mock.method(globalThis, 'fetch', async () => new Response(leaf));

  const chain = await resolveChain(leaf);
  assert.equal(chain.length, 1);
});

test('resolveChain stops when the distribution point is unreachable', async (t) => {
  const leaf = await readFixture('leaf.pem');

  t.mock.method(globalThis, 'fetch', async () => new Response('gone', { status: 404 }));

  await assert.rejects(resolveChain(leaf), /Failed to fetch issuer certificate/);
});
