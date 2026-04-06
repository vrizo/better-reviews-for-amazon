import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

export const packageVersion = packageJson.version;
export const packageName = packageJson.name;

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

export const extensionIcons = Object.freeze({
  16: 'icons/icon-16.png',
  32: 'icons/icon-32.png',
  48: 'icons/icon-48.png',
  128: 'icons/icon-128.png'
});

export const extensionIconSizes = Object.freeze(
  Object.keys(extensionIcons).map((size) => Number(size))
);

export const marketplaceGroups = Object.freeze({
  browserExtension: {
    name: 'Better Reviews for Amazon',
    description: 'Shows better review signals on Amazon product pages.',
    permissions: [],
    hostPermissions: manifestMatchPatterns,
    icons: extensionIcons
  },
  userscript: {
    name: 'Better Reviews for Amazon',
    description: 'Shows better review signals on Amazon product pages.'
  }
});

export const manifestBase = {
  manifest_version: 3,
  name: '__MSG_extensionName__',
  version: packageVersion,
  description: '__MSG_extensionDescription__',
  default_locale: 'en',
  icons: marketplaceGroups.browserExtension.icons,
  ...(marketplaceGroups.browserExtension.permissions.length > 0
    ? { permissions: marketplaceGroups.browserExtension.permissions }
    : {}),
  host_permissions: marketplaceGroups.browserExtension.hostPermissions,
  content_scripts: [
    {
      matches: marketplaceGroups.browserExtension.hostPermissions,
      js: ['content.js'],
      run_at: 'document_idle'
    }
  ]
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
