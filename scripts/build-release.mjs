import { execFile } from 'node:child_process';
import { mkdir, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { packageName, packageVersion } from './manifest-base.mjs';

const execFileAsync = promisify(execFile);
const distDir = new URL('../dist/', import.meta.url);
const releaseDir = new URL('../dist/release/', import.meta.url);
const distPath = fileURLToPath(distDir);

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

for (const target of ['chrome', 'firefox']) {
  const archiveName = `${packageName}-${target}-${packageVersion}.zip`;

  try {
    await execFileAsync('zip', ['-qr', '-X', archiveName, target], {
      cwd: distPath
    });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('zip command is required to build release archives.');
    }

    throw error;
  }

  await rename(
    new URL(archiveName, distDir),
    new URL(archiveName, releaseDir)
  );
}
