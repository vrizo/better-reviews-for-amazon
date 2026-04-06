import { UI_ID } from './constants';
import type { ReviewStats } from './types';

export function buildContainer() {
  const container = document.createElement('div');
  container.id = UI_ID;
  container.className = 'a-row a-spacing-small';
  container.style.marginTop = '4px';

  const loading = document.createElement('span');
  loading.className = 'a-size-small a-color-secondary';
  loading.textContent = 'Loading review stats...';

  container.appendChild(loading);
  return container;
}

export function renderStats(container: HTMLElement, stats: ReviewStats) {
  container.replaceChildren();

  const verifiedRow = makeRow();
  verifiedRow.appendChild(makeLinkedLabel('Verified purchase reviews', stats.urls.verified));
  verifiedRow.appendChild(document.createTextNode(': '));
  verifiedRow.appendChild(makeBoldText(formatVerifiedSummary(stats.verifiedRating, stats.verifiedCount)));

  const sentimentRow = makeRow();
  sentimentRow.appendChild(makeInlineLinkedStat('Critical reviews', stats.criticalVerifiedCount, stats.urls.critical));
  sentimentRow.appendChild(makeSeparator());
  sentimentRow.appendChild(makeInlineLinkedStat('Positive reviews', stats.positiveVerifiedCount, stats.urls.positive));

  const vineRow = makeRow();
  vineRow.appendChild(makeTextStat('Vine reviews', stats.vineCount));

  if (stats.stale) {
    vineRow.appendChild(makeSeparator());
    const stale = document.createElement('span');
    stale.className = 'a-color-secondary';
    stale.title = 'Showing cached data because the live review pages were unavailable.';
    stale.textContent = 'cached';
    vineRow.appendChild(stale);
  }

  container.append(verifiedRow, sentimentRow, vineRow);
}

export function renderError(container: HTMLElement, error: unknown) {
  container.replaceChildren();

  const message = document.createElement('span');
  message.className = 'a-size-small a-color-secondary';
  message.title = error instanceof Error ? error.message : 'Unknown error';
  message.textContent =
    error instanceof Error && /signed-in session/i.test(error.message)
      ? 'Review stats unavailable: sign in required'
      : 'Review stats unavailable';

  container.appendChild(message);
}

function makeLinkedLabel(label: string, href: string) {
  const link = document.createElement('a');
  link.className = 'a-link-normal';
  link.href = href;
  link.textContent = label;
  return link;
}

function makeInlineLinkedStat(label: string, value: number, href: string) {
  const wrapper = document.createElement('span');
  wrapper.append(makeLinkedLabel(label, href), document.createTextNode(': '), makeBoldText(formatCount(value)));
  return wrapper;
}

function makeTextStat(label: string, value: number) {
  const wrapper = document.createElement('span');
  const labelNode = document.createElement('span');
  labelNode.textContent = `${label}: `;
  wrapper.append(labelNode, makeBoldText(formatCount(value)));
  return wrapper;
}

function makeBoldText(text: string) {
  const value = document.createElement('span');
  value.className = 'a-color-base a-text-bold';
  value.textContent = text;
  return value;
}

function makeRow() {
  const row = document.createElement('div');
  row.className = 'a-size-small a-color-secondary';
  row.style.lineHeight = '1.4';
  return row;
}

function makeSeparator() {
  const separator = document.createElement('span');
  separator.className = 'a-color-secondary';
  separator.style.margin = '0 6px';
  separator.textContent = '|';
  return separator;
}

function formatCount(value: number) {
  const locale = document.documentElement.lang || undefined;
  return new Intl.NumberFormat(locale).format(value);
}

function formatRating(value: number) {
  const locale = document.documentElement.lang || undefined;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatVerifiedSummary(rating: number | null, count: number) {
  return typeof rating !== 'number' || Number.isNaN(rating)
    ? `(${formatCount(count)})`
    : `${formatRating(rating)} (${formatCount(count)})`;
}
