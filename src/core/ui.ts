import type { LocaleMessages, SupportedLocale } from '../i18n/generated';
import { UI_ID } from './constants';
import type { ReviewStats } from './types';

type UiMessages = LocaleMessages['ui'];

export function buildContainer(messages: UiMessages) {
  const container = document.createElement('div');
  container.id = UI_ID;
  container.className = 'a-row a-spacing-small';
  container.style.marginTop = '4px';

  const loading = document.createElement('span');
  loading.className = 'a-size-small a-color-secondary';
  loading.textContent = messages.loading;

  container.appendChild(loading);
  return container;
}

export function renderStats(
  container: HTMLElement,
  stats: ReviewStats,
  { locale, messages }: { locale: SupportedLocale; messages: UiMessages }
) {
  container.replaceChildren();

  const verifiedRow = makeRow();
  verifiedRow.appendChild(makeLinkedLabel(messages.verifiedPurchaseReviews, stats.urls.verified));
  verifiedRow.appendChild(document.createTextNode(': '));
  verifiedRow.appendChild(makeBoldText(formatVerifiedSummary(stats.verifiedRating, stats.verifiedCount, locale)));

  const sentimentRow = makeRow();
  sentimentRow.appendChild(
    makeInlineLinkedStat(messages.criticalReviews, stats.criticalVerifiedCount, stats.urls.critical, locale)
  );
  sentimentRow.appendChild(makeSeparator());
  sentimentRow.appendChild(
    makeInlineLinkedStat(messages.positiveReviews, stats.positiveVerifiedCount, stats.urls.positive, locale)
  );

  const vineRow = makeRow();
  vineRow.appendChild(makeTextStat(messages.vineReviews, stats.vineCount, locale));

  if (stats.stale) {
    vineRow.appendChild(makeSeparator());
    const stale = document.createElement('span');
    stale.className = 'a-color-secondary';
    stale.title = messages.cachedTitle;
    stale.textContent = messages.cachedLabel;
    vineRow.appendChild(stale);
  }

  container.append(verifiedRow, sentimentRow, vineRow);
}

export function renderError(container: HTMLElement, error: unknown, messages: UiMessages) {
  container.replaceChildren();

  const isSignInRequired = error instanceof Error && /signed-in session/i.test(error.message);
  const message = document.createElement('span');
  message.className = 'a-size-small a-color-secondary';
  message.title = isSignInRequired ? messages.errorSignInRequired : messages.errorUnavailable;
  message.textContent = isSignInRequired ? messages.errorSignInRequired : messages.errorUnavailable;

  container.appendChild(message);
}

function makeLinkedLabel(label: string, href: string) {
  const link = document.createElement('a');
  link.className = 'a-link-normal';
  link.href = href;
  link.textContent = label;
  return link;
}

function makeInlineLinkedStat(label: string, value: number, href: string, locale: SupportedLocale) {
  const wrapper = document.createElement('span');
  wrapper.append(makeLinkedLabel(label, href), document.createTextNode(': '), makeBoldText(formatCount(value, locale)));
  return wrapper;
}

function makeTextStat(label: string, value: number, locale: SupportedLocale) {
  const wrapper = document.createElement('span');
  const labelNode = document.createElement('span');
  labelNode.textContent = `${label}: `;
  wrapper.append(labelNode, makeBoldText(formatCount(value, locale)));
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

function formatCount(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatRating(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatVerifiedSummary(rating: number | null, count: number, locale: SupportedLocale) {
  return typeof rating !== 'number' || Number.isNaN(rating)
    ? `(${formatCount(count, locale)})`
    : `${formatRating(rating, locale)} (${formatCount(count, locale)})`;
}
