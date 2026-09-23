import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createTlsServer } from 'node:tls';
import { readFile } from 'node:fs/promises';
import { before, after, test } from 'node:test';

import { runCli, fixturePath } from './helpers.js';

// Must match the AIA URL baked into the leaf fixture (see fixtures/generate.sh)
const AIA_PORT = 18473;

/** @type {import('node:http').Server} */
let aiaServer;
/** @type {import('node:tls').Server} */
let incompleteChainServer;
/** @type {import('node:tls').Server} */
let completeChainServer;
let incompleteChainPort;
let completeChainPort;

before(async () => {
  // Distribution point serving the intermediate certificate in DER form
  const intermediateDer = await readFile(fixturePath('intermediate.der'));
  aiaServer = createHttpServer((request, response) => {
    response.setHeader('content-type', 'application/pkix-cert');
    response.end(intermediateDer);
  });
  await new Promise((resolve) => aiaServer.listen(AIA_PORT, '127.0.0.1', resolve));

  const key = await readFile(fixturePath('leaf.key'));
  const leaf = await readFile(fixturePath('leaf.pem'));
  const fullChain = await readFile(fixturePath('leaf-fullchain.pem'));

  // Serves only the leaf: an incomplete chain
  incompleteChainServer = createTlsServer({ key, cert: leaf }, (socket) => socket.end());
  await new Promise((resolve) => {
    incompleteChainServer.listen(0, '127.0.0.1', () => {
      incompleteChainPort = incompleteChainServer.address().port;
      resolve();
    });
  });

  // Serves leaf plus intermediate: a complete chain
  completeChainServer = createTlsServer({ key, cert: fullChain }, (socket) => socket.end());
  await new Promise((resolve) => {
    completeChainServer.listen(0, '127.0.0.1', () => {
      completeChainPort = completeChainServer.address().port;
      resolve();
    });
  });
});

after(async () => {
  await Promise.all([
    new Promise((resolve) => aiaServer.close(resolve)),
    new Promise((resolve) => incompleteChainServer.close(resolve)),
    new Promise((resolve) => completeChainServer.close(resolve))
  ]);
});

test('--version prints the package version', async () => {
  const result = await runCli(['--version']);
  assert.match(result.stdout, /^2\.0\.0/);
});

test('crt accepts a positional hostname', async () => {
  const result = await runCli(['crt', `localhost:${incompleteChainPort}`]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Certificate \(PEM\):/);
  assert.match(result.stdout, / {2}Subject\n\s+CN\s+localhost/);
  assert.match(result.stdout, / {2}Validity\n\s+From\s/);
  assert.match(result.stderr, /localhost:\d+ — valid for another \d+ days?/);
  assert.doesNotMatch(result.stdout, /undefined/);
});

test('crt reads a certificate from a file', async () => {
  const result = await runCli(['crt', '-f', fixturePath('leaf.pem')]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, / {2}Issuer\n\s+CN\s+tlstools test intermediate CA/);
  assert.match(result.stderr, /leaf\.pem — valid for another \d+ days?/);
});

test('crt fails without an input source', async () => {
  const result = await runCli(['crt']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /No input specified/);
});

test('crt fails on a missing file', async () => {
  const result = await runCli(['crt', '-f', '/tmp/tlstools-does-not-exist.pem']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /does not exist/);
});

test('check reports an incomplete chain with exit code 1', async () => {
  const result = await runCli(['check', `localhost:${incompleteChainPort}`]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /chain incomplete, 1 intermediate missing/);
  assert.match(result.stderr, /tlstools test intermediate CA/);
});

test('check reports a complete chain with exit code 0', async () => {
  const result = await runCli(['check', `localhost:${completeChainPort}`]);
  assert.equal(result.code, 0);
  assert.match(result.stderr, /— chain complete/);
});

test('chain resolves the intermediate over AIA and prints only PEM to stdout', async () => {
  const result = await runCli(['chain', '-f', fixturePath('leaf.pem')]);
  assert.equal(result.code, 0);
  assert.equal((result.stdout.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length, 2);
  assert.match(result.stderr, /Resolved certificate chain with 1 intermediate/);
});

test('csr decodes a certificate request from a file', async () => {
  const result = await runCli(['csr', '-f', fixturePath('csr.pem')]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Request \(PEM\):/);
  assert.match(result.stdout, / {2}Subject\n\s+CN\s+csr\.example\.com/);
  assert.doesNotMatch(result.stdout, /undefined/);
});

test('unknown commands fail', async () => {
  const result = await runCli(['nope']);
  assert.notEqual(result.code, 0);
});
