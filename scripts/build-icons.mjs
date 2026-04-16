import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import { extensionIconSizes } from './manifest-base.mjs';

const channels = ['chrome', 'firefox'];
const sourceIcon = await readFile(new URL('../src/icon.svg', import.meta.url), 'utf8');

for (const channel of channels) {
  const iconsDir = new URL(`../dist/${channel}/icons/`, import.meta.url);
  await mkdir(iconsDir, { recursive: true });

  for (const size of extensionIconSizes) {
    await writeFile(new URL(`icon-${size}.png`, iconsDir), renderIconPng(size));
  }
}

function renderIconPng(size) {
  const icon = new Resvg(sourceIcon, {
    fitTo: {
      mode: 'width',
      value: size
    }
  });

  return icon.render().asPng();
}
