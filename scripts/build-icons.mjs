import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import { extensionIconSizes } from './manifest-base.mjs';

const channels = ['chrome', 'firefox'];

for (const channel of channels) {
  const iconsDir = new URL(`../dist/${channel}/icons/`, import.meta.url);
  await mkdir(iconsDir, { recursive: true });

  for (const size of extensionIconSizes) {
    await writeFile(new URL(`icon-${size}.png`, iconsDir), createIconPng(size));
  }
}

function createIconPng(size) {
  const pixels = new Uint8Array(size * size * 4);
  const colors = {
    page: [250, 246, 237, 255],
    border: [41, 58, 95, 255],
    strong: [31, 92, 122, 255],
    accent: [224, 138, 65, 255],
    badge: [104, 147, 78, 255]
  };

  const margin = Math.max(1, Math.round(size * 0.125));
  const border = Math.max(1, Math.round(size * 0.08));
  const badgeRadius = Math.max(2, Math.round(size * 0.12));
  const barHeight = Math.max(1, Math.round(size * 0.11));
  const barGap = Math.max(1, Math.round(size * 0.07));
  const barX = margin + border + Math.max(1, Math.round(size * 0.04));
  const barRight = size - margin - border - Math.max(1, Math.round(size * 0.18));
  const firstBarY = margin + border + Math.max(1, Math.round(size * 0.18));

  fillRoundedRect(pixels, size, margin, margin, size - margin - 1, size - margin - 1, Math.max(2, Math.round(size * 0.16)), colors.page);
  drawRoundedBorder(
    pixels,
    size,
    margin,
    margin,
    size - margin - 1,
    size - margin - 1,
    Math.max(2, Math.round(size * 0.16)),
    border,
    colors.border
  );

  drawRoundedBar(pixels, size, barX, firstBarY, barRight - Math.round(size * 0.1), firstBarY + barHeight - 1, Math.ceil(barHeight / 2), colors.strong);
  drawRoundedBar(
    pixels,
    size,
    barX,
    firstBarY + barHeight + barGap,
    barRight,
    firstBarY + (barHeight * 2) + barGap - 1,
    Math.ceil(barHeight / 2),
    colors.accent
  );
  drawRoundedBar(
    pixels,
    size,
    barX,
    firstBarY + (barHeight * 2) + (barGap * 2),
    barRight - Math.round(size * 0.18),
    firstBarY + (barHeight * 3) + (barGap * 2) - 1,
    Math.ceil(barHeight / 2),
    colors.strong
  );

  fillCircle(
    pixels,
    size,
    size - margin - border - badgeRadius,
    margin + border + badgeRadius,
    badgeRadius,
    colors.badge
  );

  return encodePng(size, size, pixels);
}

function fillRoundedRect(pixels, width, left, top, right, bottom, radius, color) {
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (isInsideRoundedRect(x, y, left, top, right, bottom, radius)) {
        setPixel(pixels, width, x, y, color);
      }
    }
  }
}

function drawRoundedBorder(pixels, width, left, top, right, bottom, radius, thickness, color) {
  fillRoundedRect(pixels, width, left, top, right, bottom, radius, color);
  fillRoundedRect(
    pixels,
    width,
    left + thickness,
    top + thickness,
    right - thickness,
    bottom - thickness,
    Math.max(0, radius - thickness),
    [250, 246, 237, 255]
  );
}

function drawRoundedBar(pixels, width, left, top, right, bottom, radius, color) {
  fillRoundedRect(pixels, width, left, top, right, bottom, radius, color);
}

function fillCircle(pixels, width, centerX, centerY, radius, color) {
  const radiusSquared = radius * radius;

  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;

      if ((dx * dx) + (dy * dy) <= radiusSquared) {
        setPixel(pixels, width, x, y, color);
      }
    }
  }
}

function isInsideRoundedRect(x, y, left, top, right, bottom, radius) {
  if (x < left || x > right || y < top || y > bottom) {
    return false;
  }

  const horizontalLeft = left + radius;
  const horizontalRight = right - radius;
  const verticalTop = top + radius;
  const verticalBottom = bottom - radius;

  if ((x >= horizontalLeft && x <= horizontalRight) || (y >= verticalTop && y <= verticalBottom)) {
    return true;
  }

  const cornerX = x < horizontalLeft ? horizontalLeft : horizontalRight;
  const cornerY = y < verticalTop ? verticalTop : verticalBottom;
  const dx = x - cornerX;
  const dy = y - cornerY;

  return (dx * dx) + (dy * dy) <= (radius * radius);
}

function setPixel(pixels, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= width) {
    return;
  }

  const offset = (y * width * 4) + (x * 4);
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const rows = [];

  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    const end = start + (width * 4);
    rows.push(Buffer.concat([Buffer.from([0]), Buffer.from(pixels.slice(start, end))]));
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(Buffer.concat(rows));

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', idat),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calculateCrc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function calculateCrc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let index = 0; index < 8; index += 1) {
      const carry = crc & 1;
      crc >>>= 1;

      if (carry !== 0) {
        crc ^= 0xedb88320;
      }
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}
