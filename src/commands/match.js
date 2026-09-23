/*
 * Copyright (c) 2026 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import openssl from 'openssl-cert-tools';
import { out, success, error, printJson } from '../output.js';
import {
  readFileContent,
  extractCertificate,
  extractCertificateRequest,
  extractPrivateKey
} from '../input.js';

const INPUT_SPECS = [
  { flag: 'crt', type: 'Certificate', kind: 'certificate', label: 'certificate', extract: extractCertificate },
  { flag: 'key', type: 'Key', kind: 'key', label: 'private key', extract: extractPrivateKey },
  { flag: 'csr', type: 'Request', kind: 'request', label: 'certificate request', extract: extractCertificateRequest }
];

/**
 * Compare the public keys of the provided inputs by their SPKI hash:
 * inputs from the same keypair share it, regardless of key algorithm.
 */
export const match = new Command('match')
  .description('check that a certificate, private key and/or CSR share the same public key')
  .option('--crt <file>', 'certificate file to compare')
  .option('--key <file>', 'private key file to compare')
  .option('--csr <file>', 'certificate request file to compare')
  .option('--json', 'output machine-readable JSON instead of the formatted report')
  .action(async (options) => {
    const active = INPUT_SPECS.filter((spec) => options[spec.flag]);
    if (active.length < 2) {
      throw new Error('At least two of --crt, --key or --csr are required to compare');
    }

    const inputs = await Promise.all(active.map(async (spec) => {
      const content = await readFileContent(options[spec.flag]);
      const pem = spec.extract(content);
      if (!pem) {
        throw new Error(`No ${spec.label} found in file "${options[spec.flag]}"`);
      }
      return {
        type: spec.type,
        source: options[spec.flag],
        publicKeySha256: await openssl.getPublicKeyHash(pem, spec.kind)
      };
    }));

    // The first input is the reference; every other input is compared to it
    const reference = inputs[0].publicKeySha256;
    const allMatch = inputs.every((input) => input.publicKeySha256 === reference);

    if (options.json) {
      printJson({ match: allMatch, inputs });
      process.exitCode = allMatch ? 0 : 1;
      return;
    }

    const typeWidth = Math.max(...inputs.map((input) => input.type.length)) + 1;
    for (const input of inputs) {
      const hashColor = input.publicKeySha256 === reference ? pc.green : pc.red;
      out(`  ${pc.dim(input.type.padEnd(typeWidth))} ${input.source}  ${hashColor(input.publicKeySha256.slice(0, 16))}`);
    }

    if (allMatch) {
      success('all inputs share the same public key');
      return;
    }
    error('inputs do not all share the same public key');
    process.exitCode = 1;
  });
