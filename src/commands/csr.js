/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { out, notice, printSections } from '../output.js';
import { obtainCertificateRequest } from '../input.js';

/**
 * Print decoded certificate request (CSR) information to stdout,
 * closed by a notice on stderr.
 * @param {string} request PEM encoded certificate request
 */
async function displayCertificateRequestInfo(request) {
  const info = await openssl.getCertificateRequestInfo(request);

  out(pc.bold('Request (PEM):'));
  out(pc.dim(String(info.certificate).trimEnd()));

  out();
  printSections([['Subject', Object.entries(info.subject)]]);

  notice(pc.bold('certificate signing request'));
}

export const csr = new Command('csr')
  .description('decode certificate request information')
  .option('-f, --filename <file>', 'use certificate request from local file')
  .option('-c, --clipboard', 'use certificate request from clipboard')
  .action(async (options) => {
    const request = await obtainCertificateRequest(options);

    await displayCertificateRequestInfo(request);
  });
