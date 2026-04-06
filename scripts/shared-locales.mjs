import { readdir, readFile } from 'node:fs/promises';

const localesDir = new URL('../src/i18n/locales/', import.meta.url);

export const defaultLocale = 'en';

export async function loadLocaleCatalog() {
  const localeFiles = (await readdir(localesDir))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort((left, right) => left.localeCompare(right));

  if (!localeFiles.includes(`${defaultLocale}.json`)) {
    throw new Error(`Missing default locale file: ${defaultLocale}.json`);
  }

  const localeCatalog = {};
  for (const fileName of localeFiles) {
    const locale = fileName.replace(/\.json$/u, '');
    const content = await readFile(new URL(fileName, localesDir), 'utf8');
    localeCatalog[locale] = JSON.parse(content);
  }

  return localeCatalog;
}

export function buildManifestLocaleMessages(messages) {
  return {
    extensionName: {
      message: messages.meta.name
    },
    extensionDescription: {
      message: messages.meta.description
    }
  };
}
