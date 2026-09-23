import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

export const binPath = fileURLToPath(new URL('../bin/tls.js', import.meta.url));

/**
 * Absolute path of a fixture file.
 * @param {string} name
 */
export const fixturePath = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

/**
 * Run the CLI against the given arguments.
 * Async (not spawnSync) so local test servers keep serving while
 * the child process talks to them.
 * @param {string[]} args
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
export async function runCli(args) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [binPath, ...args], {
      encoding: 'utf8',
      timeout: 30000
    });
    return { code: 0, stdout, stderr };
  } catch (err) {
    return { code: err.code ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}
