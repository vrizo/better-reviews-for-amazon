import { execFile } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { packageName, packageVersion } from './manifest-base.mjs';

const execFileAsync = promisify(execFile);
const distDir = new URL('../dist/', import.meta.url);
const releaseDir = new URL('../dist/release/', import.meta.url);
const releasePath = fileURLToPath(releaseDir);

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

for (const { target, extension } of [
  { target: 'chrome', extension: 'zip' },
  { target: 'firefox', extension: 'xpi' }
]) {
  const archiveName = `${packageName}-${target}-${packageVersion}.${extension}`;
  const targetPath = fileURLToPath(new URL(`../dist/${target}/`, import.meta.url));

  try {
    // Package the extension directory contents at archive root so the stores
    // can read manifest.json directly from the uploaded archive.
    await execFileAsync('zip', ['-qr', '-X', `${releasePath}/${archiveName}`, '.'], {
      cwd: targetPath
    });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('zip command is required to build release archives.');
    }

    throw error;
  }
}
