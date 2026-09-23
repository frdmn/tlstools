/*
 * Copyright (c) 2020 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { success, error } from '../output.js';
import { parseHostOption, resolveHostname } from '../input.js';
import { resolveChain, certBody } from '../chain-resolver.js';

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
      success(`${pc.bold(`${host}:${port}`)} ${pc.green('— chain complete')}`);
      return;
    }

    const intermediateWord = missing.length === 1 ? 'intermediate' : 'intermediates';
    error(`${pc.bold(`${host}:${port}`)} ${pc.red(`— chain incomplete, ${missing.length} ${intermediateWord} missing`)}`);
    console.error('');
    const names = await Promise.all(missing.map(async (pem, i) => {
      try {
        return await certName(pem);
      } catch {
        return `Intermediate ${i + 1}`;
      }
    }));
    for (const name of names) {
      console.error(`    ${pc.red('✖')} ${name}`);
    }
    console.error('');
    console.error(`  ${pc.dim('↳')} ${pc.underline(pc.cyan(`https://www.ssllabs.com/ssltest/analyze.html?d=${host}:${port}&latest`))}`);
    process.exitCode = 1;
  });
