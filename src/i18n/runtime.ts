import { defaultLocale, localeCatalog, type LocaleMessages, type SupportedLocale } from './generated';

export function getLocaleMessages(locale: SupportedLocale): LocaleMessages {
  return localeCatalog[locale];
}

export function resolveAmazonPageLocale(doc: Document = document): SupportedLocale {
  return (
    normalizeLocaleTag(doc.documentElement.getAttribute('lang')) ??
    normalizeLocaleTag(readLocaleFromPath(doc.location?.pathname ?? location.pathname)) ??
    defaultLocale
  );
}

export function normalizeLocaleTag(locale: string | null | undefined): SupportedLocale | null {
  if (!locale) {
    return null;
  }

  const normalized = locale.trim().toLowerCase().replace(/_/gu, '-');
  if (!normalized) {
    return null;
  }

  if (normalized in localeCatalog) {
    return normalized as SupportedLocale;
  }

  const baseLocale = normalized.split('-')[0];
  return baseLocale in localeCatalog ? (baseLocale as SupportedLocale) : null;
}

function readLocaleFromPath(pathname: string) {
  return pathname.match(/^\/-\/([a-z]{2}(?:-[a-z]{2})?)\//iu)?.[1] ?? null;
}
