/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { Command } from 'commander';
import pc from 'picocolors';
import { out, success, withSpinner, plural, printJson } from '../output.js';
import { obtainCertificate, resolveHostname } from '../input.js';
import { resolveChain } from '../chain-resolver.js';

export const chain = new Command('chain')
  .description('attempt to fix incomplete certificate chain')
  .argument('[hostname]', 'remote host[:port] to inspect')
  .option('-H, --hostname <host[:port]>', 'use certificate from remote hostname')
  .option('-f, --filename <file>', 'use certificate from local file')
  .option('-c, --clipboard', 'use certificate from clipboard')
  .option('--json', 'output machine-readable JSON instead of the formatted report')
  .action(async (hostname, options) => {
    const target = resolveHostname(options, hostname);
    const resolved = await withSpinner(
      target ? `Resolving certificate chain of ${target}` : 'Resolving certificate chain',
      async () => resolveChain(await obtainCertificate({
        hostname: target,
        filename: options.filename,
        clipboard: options.clipboard
      }))
    );

    if (resolved.length <= 1) {
      throw new Error('Unable to resolve intermediate certificates: no usable AIA "CA Issuers" information found');
    }

    if (options.json) {
      printJson({
        chain: resolved.map((pem) => pem.trim()),
        intermediateCount: resolved.length - 1
      });
      return;
    }

    out(pc.dim(resolved.join('\n')));
    const intermediateCount = resolved.length - 1;
    success(`Resolved certificate chain with ${intermediateCount} ${plural(intermediateCount, 'intermediate certificate')}`);
  });
