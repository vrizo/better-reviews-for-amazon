import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { marketplaceGroups, packageVersion } from './manifest-base.mjs';

const header = `// ==UserScript==
// @name         ${marketplaceGroups.userscript.name}
// @namespace    https://openai.com/codex
// @version      ${packageVersion}
// @description  ${marketplaceGroups.userscript.description}
// @include      /^https:\\/\\/(www\\.)?amazon\\.[^/]+\\/.*$/
// @grant        none
// @run-at       document-idle
// ==/UserScript==
`;

await mkdir(new URL('../dist/userscript/', import.meta.url), { recursive: true });

await build({
  entryPoints: ['src/userscript/index.ts'],
  outfile: 'dist/userscript/better-reviews-for-amazon.user.js',
  bundle: true,
  format: 'iife',
  target: 'es2022',
  legalComments: 'none'
});

const builtScript = await readFile('dist/userscript/better-reviews-for-amazon.user.js', 'utf8');
await writeFile('better-reviews-for-amazon.user.js', `${header}\n${builtScript}`, 'utf8');
