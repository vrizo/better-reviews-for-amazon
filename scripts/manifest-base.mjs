import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

export const packageVersion = packageJson.version;

export const manifestMatchPatterns = [
  'https://www.amazon.com/*',
  'https://www.amazon.ca/*',
  'https://www.amazon.com.mx/*',
  'https://www.amazon.com.br/*',
  'https://www.amazon.co.uk/*',
  'https://www.amazon.de/*',
  'https://www.amazon.fr/*',
  'https://www.amazon.it/*',
  'https://www.amazon.es/*',
  'https://www.amazon.nl/*',
  'https://www.amazon.pl/*',
  'https://www.amazon.se/*',
  'https://www.amazon.com.tr/*',
  'https://www.amazon.ae/*',
  'https://www.amazon.sa/*',
  'https://www.amazon.eg/*',
  'https://www.amazon.sg/*',
  'https://www.amazon.com.au/*',
  'https://www.amazon.co.jp/*',
  'https://www.amazon.in/*'
];

export const manifestBase = {
  manifest_version: 3,
  name: 'Better Reviews for Amazon',
  version: packageVersion,
  description: 'Shows better review signals on Amazon product pages.',
  content_scripts: [
    {
      matches: manifestMatchPatterns,
      js: ['content.js'],
      run_at: 'document_idle'
    }
  ],
  host_permissions: manifestMatchPatterns
};

export function buildChromeManifest() {
  return {
    ...manifestBase
  };
}

export function buildFirefoxManifest() {
  return {
    ...manifestBase,
    browser_specific_settings: {
      gecko: {
        id: 'better-reviews-for-amazon@vrizo.github'
      }
    }
  };
}
