import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { packageVersion } from './manifest-base.mjs';
import { defaultLocale, loadLocaleCatalog } from './shared-locales.mjs';

const localeCatalog = await loadLocaleCatalog();
const defaultMessages = localeCatalog[defaultLocale];
const localizedHeader = Object.entries(localeCatalog)
  .filter(([locale]) => locale !== defaultLocale)
  .flatMap(([locale, messages]) => [
    `// @name:${locale}    ${messages.meta.name}`,
    `// @description:${locale} ${messages.meta.description}`
  ])
  .join('\n');

const header = `// ==UserScript==
// @name         ${defaultMessages.meta.name}
// @namespace    https://openai.com/codex
// @version      ${packageVersion}
// @description  ${defaultMessages.meta.description}
${localizedHeader}
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
