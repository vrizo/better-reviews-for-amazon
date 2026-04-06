import { mkdir, writeFile } from 'node:fs/promises';
import { buildChromeManifest, buildFirefoxManifest } from './manifest-base.mjs';

const chromeDir = new URL('../dist/chrome/', import.meta.url);
const firefoxDir = new URL('../dist/firefox/', import.meta.url);

await mkdir(chromeDir, { recursive: true });
await mkdir(firefoxDir, { recursive: true });

await writeFile(
  new URL('manifest.json', chromeDir),
  `${JSON.stringify(buildChromeManifest(), null, 2)}\n`,
  'utf8'
);

await writeFile(
  new URL('manifest.json', firefoxDir),
  `${JSON.stringify(buildFirefoxManifest(), null, 2)}\n`,
  'utf8'
);
