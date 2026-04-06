import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir(new URL('../dist/chrome/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/firefox/', import.meta.url), { recursive: true });
await mkdir(new URL('../dist/userscript/', import.meta.url), { recursive: true });

await Promise.all([
  build({
    entryPoints: ['src/chrome-extension/content.ts'],
    outfile: 'dist/chrome/content.js',
    bundle: true,
    format: 'iife',
    target: 'es2022',
    legalComments: 'none'
  }),
  build({
    entryPoints: ['src/firefox-extension/content.ts'],
    outfile: 'dist/firefox/content.js',
    bundle: true,
    format: 'iife',
    target: 'es2022',
    legalComments: 'none'
  })
]);
