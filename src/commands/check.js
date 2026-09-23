/*
 * Copyright (c) 2020 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { success, error, withSpinner, plural, printJson } from '../output.js';
import { parseHostOption, resolveHostname } from '../input.js';
import { resolveChain, certIdentity } from '../chain-resolver.js';

/**
 * Best-effort human-readable name for a PEM certificate
 * (subject CN, or all subject values joined).
 * @param {string} pem
 * @returns {Promise<string>}
 */
async function certName(pem) {
  const { subject } = await openssl.getCertificateInfo(pem);
  return subject.CN ?? Object.values(subject).join(', ');
}

export const check = new Command('check')
  .description('check remote certificate chain')
  .argument('[hostname]', 'remote host[:port] to check')
  .option('-H, --hostname <host[:port]>', 'check certificate chain of remote hostname')
  .option('--json', 'output machine-readable JSON instead of the formatted report')
  .action(async (hostname, options) => {
    const target = resolveHostname(options, hostname);
    if (!target) {
      throw new Error('No hostname specified: pass a hostname or -H/--hostname');
    }
    const { host, port } = parseHostOption(target);

    const { missing, names } = await withSpinner(`Checking certificate chain of ${host}:${port}`, async () => {
      let served;
      try {
        served = await openssl.getCertificateChain(host, port);
      } catch (err) {
        throw new Error(`Couldn't get certificate chain of ${host}:${port}: ${err.message}`, { cause: err });
      }

      const resolved = await resolveChain(served[0]);
      // Compare by key identity, not bytes: the AIA distribution point may
      // serve a different cross-signing of an intermediate than the one
      // the server presents — same CA, same key, valid chain either way.
      const servedIdentities = new Set(await Promise.all(served.slice(1).map(certIdentity)));
      const missingPems = [];
      for (const pem of resolved.slice(1)) {
        if (!servedIdentities.has(await certIdentity(pem))) {
          missingPems.push(pem);
        }
      }
      const missingNames = await Promise.all(missingPems.map(async (pem, i) => {
        try {
          return await certName(pem);
        } catch {
          return `Intermediate ${i + 1}`;
        }
      }));

      return { missing: missingPems, names: missingNames };
    });

    if (options.json) {
      printJson({
        host,
        port,
        complete: missing.length === 0,
        missingIntermediates: names
      });
      if (missing.length > 0) {
        process.exitCode = 1;
      }
      return;
    }

    if (missing.length === 0) {
      success(`${pc.bold(`${host}:${port}`)} ${pc.green('— chain complete')}`);
      return;
    }

    error(`${pc.bold(`${host}:${port}`)} ${pc.red(`— chain incomplete, ${missing.length} ${plural(missing.length, 'intermediate')} missing`)}`);
    console.error('');
    for (const name of names) {
      console.error(`    ${pc.red('✖')} ${name}`);
    }
    console.error('');
    console.error(`  ${pc.dim('↳')} ${pc.underline(pc.cyan(`https://www.ssllabs.com/ssltest/analyze.html?d=${host}:${port}&latest`))}`);
    process.exitCode = 1;
  });
