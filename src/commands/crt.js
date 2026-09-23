/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { out } from '../output.js';
import { obtainCertificate, resolveHostname } from '../input.js';

/**
 * Print decoded certificate information to stdout.
 * @param {string} certificate PEM encoded certificate
 */
async function displayCertificateInfo(certificate) {
  const info = await openssl.getCertificateInfo(certificate);

  out(pc.bold('Certificate:'));
  out(String(info.certificate));

  out(pc.bold('Issuer:'));
  for (const [key, value] of Object.entries(info.issuer)) {
    out(` - ${key}: ${value}`);
  }

  out(pc.bold('Subject:'));
  for (const [key, value] of Object.entries(info.subject)) {
    out(` - ${key}: ${value}`);
  }

  out(`${pc.bold('Valid from:')} ${info.validFrom.toISOString()}`);
  out(`${pc.bold('Valid to:')} ${info.validTo.toISOString()}`);

  if (info.expiredDays !== undefined) {
    out(`${pc.bold('Expired days ago:')} ${info.expiredDays}`);
  } else {
    out(`${pc.bold('Remaining days:')} ${info.remainingDays}`);
  }
}

export const crt = new Command('crt')
  .description('display TLS information for given hostname or certificate')
  .argument('[hostname]', 'remote host[:port] to inspect')
  .option('-H, --hostname <host[:port]>', 'use certificate from remote hostname')
  .option('-f, --filename <file>', 'use certificate from local file')
  .option('-c, --clipboard', 'use certificate from clipboard')
  .action(async (hostname, options) => {
    const certificate = await obtainCertificate({
      hostname: resolveHostname(options, hostname),
      filename: options.filename,
      clipboard: options.clipboard
    });

    await displayCertificateInfo(certificate);
  });
