/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { basename } from 'node:path';
import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { out, printSections, humanDate, verdict } from '../output.js';
import { obtainCertificate, resolveHostname } from '../input.js';

/**
 * Print decoded certificate information to stdout, closed by a
 * validity verdict on stderr.
 * @param {string} certificate PEM encoded certificate
 * @param {string} label identifier for the verdict line (hostname or file name)
 */
async function displayCertificateInfo(certificate, label) {
  const info = await openssl.getCertificateInfo(certificate);

  out(pc.bold('Certificate (PEM):'));
  out(pc.dim(String(info.certificate).trimEnd()));

  out();
  printSections([
    ['Issuer', Object.entries(info.issuer)],
    ['Subject', Object.entries(info.subject)],
    ['Validity', [
      ['From', humanDate(info.validFrom)],
      ['To', humanDate(info.validTo)]
    ]]
  ]);

  verdict(label, info.expiredDays, info.remainingDays);
}

export const crt = new Command('crt')
  .description('display TLS information for given hostname or certificate')
  .argument('[hostname]', 'remote host[:port] to inspect')
  .option('-H, --hostname <host[:port]>', 'use certificate from remote hostname')
  .option('-f, --filename <file>', 'use certificate from local file')
  .option('-c, --clipboard', 'use certificate from clipboard')
  .action(async (hostname, options) => {
    const target = resolveHostname(options, hostname);
    const certificate = await obtainCertificate({
      hostname: target,
      filename: options.filename,
      clipboard: options.clipboard
    });

    const label = target ?? (options.filename ? basename(options.filename) : 'Certificate');
    await displayCertificateInfo(certificate, label);
  });
