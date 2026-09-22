/*
 * Copyright (c) 2020 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import openssl from 'openssl-cert-tools';
import { success, error } from '../output.js';
import { parseHostOption, resolveHostname } from '../input.js';
import { resolveChain, certBody } from '../chain-resolver.js';

export const check = new Command('check')
  .description('check remote certificate chain')
  .argument('[hostname]', 'remote host[:port] to check')
  .option('-H, --hostname <host[:port]>', 'check certificate chain of remote hostname')
  .action(async (hostname, options) => {
    const target = resolveHostname(options, hostname);
    if (!target) {
      throw new Error('No hostname specified: pass a hostname or -H/--hostname');
    }
    const { host, port } = parseHostOption(target);

    let served;
    try {
      served = await openssl.getCertificateChain(host, port);
    } catch (err) {
      throw new Error(`Couldn't get certificate chain of ${host}:${port}: ${err.message}`, { cause: err });
    }

    const resolved = await resolveChain(served[0]);
    const servedBodies = served.slice(1).map(certBody);
    const missing = resolved.slice(1).filter((pem) => !servedBodies.includes(certBody(pem)));

    if (missing.length === 0) {
      success(`Intermediate chain "${host}:${port}" seems to be complete/correct`);
      return;
    }

    error(`Intermediate chain for "${host}:${port}" seems to be incomplete (${missing.length} intermediate certificate(s) missing)`);
    console.error('');
    console.error('   For detailed information, please check using SSLlabs:\n');
    console.error(`   https://www.ssllabs.com/ssltest/analyze.html?d=${host}:${port}&latest`);
    process.exitCode = 1;
  });
