import { mkdir, writeFile } from 'node:fs/promises';
import { buildChromeManifest, buildFirefoxManifest } from './manifest-base.mjs';
import { buildManifestLocaleMessages, loadLocaleCatalog } from './shared-locales.mjs';

const chromeDir = new URL('../dist/chrome/', import.meta.url);
const firefoxDir = new URL('../dist/firefox/', import.meta.url);
const localeCatalog = await loadLocaleCatalog();

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

await Promise.all([
  writeLocaleMessages(chromeDir, localeCatalog),
  writeLocaleMessages(firefoxDir, localeCatalog)
]);

async function writeLocaleMessages(targetDir, locales) {
  await Promise.all(
    Object.entries(locales).map(async ([locale, messages]) => {
      const localeDir = new URL(`./_locales/${locale}/`, targetDir);
      await mkdir(localeDir, { recursive: true });
      await writeFile(
        new URL('messages.json', localeDir),
        `${JSON.stringify(buildManifestLocaleMessages(messages), null, 2)}\n`,
        'utf8'
      );
    })
  );
}
