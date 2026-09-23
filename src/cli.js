/*
 * Copyright (c) 2015 Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import { readFile } from 'node:fs/promises';
import { Command } from 'commander';
import { crt } from './commands/crt.js';
import { chain } from './commands/chain.js';
import { check } from './commands/check.js';
import { csr } from './commands/csr.js';
import { match } from './commands/match.js';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

const program = new Command();

program
  .name('tls')
  .version(packageJson.version)
  .description('CLI tool to analyze, troubleshoot or inspect SSL certificates, requests or keys')
  .addCommand(chain)
  .addCommand(check)
  .addCommand(crt)
  .addCommand(csr)
  .addCommand(match);

export default program;
