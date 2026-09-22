#!/usr/bin/env node
/*
 *          _ _              _
 *  ___ ___| | |_ ___   ___ | |___
 * / __/ __| | __/ _ \ / _ \| / __|
 * \__ \__ \ | || (_) | (_) | \__ \
 * |___/___/_|\__\___/ \___/|_|___/
 *
 * Copyright (c) 2015 by Jonas Friedmann. Please see the
 * LICENSE file for more information. All Rights Reserved.
 */

import program from '../src/cli.js';
import { error } from '../src/output.js';

program.parseAsync(process.argv).catch((err) => {
  error(err.message);
  process.exit(1);
});
