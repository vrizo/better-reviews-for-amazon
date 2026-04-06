import { fetchReviewAggregate, getAsin, waitForAnchor } from './amazon';
import { CACHE_PREFIX, CACHE_TTL_MS, REVIEWER_TYPES, STAR_FILTERS, UI_ID } from './constants';
import type { ReviewStats, StorageLike } from './types';
import { buildContainer, renderError, renderStats } from './ui';
import { getLocaleMessages, resolveAmazonPageLocale } from '../i18n/runtime';

export function runBetterReviews({
  storage = window.localStorage,
  logPrefix = '[better-reviews-for-amazon]'
}: {
  storage?: StorageLike;
  logPrefix?: string;
} = {}) {
  init(storage).catch((error) => {
    console.error(logPrefix, error);
  });
}

async function init(storage: StorageLike) {
  const asin = getAsin();
  if (!asin) {
    return;
  }

  const locale = resolveAmazonPageLocale();
  const messages = getLocaleMessages(locale).ui;

  const anchor = await waitForAnchor();
  if (!anchor || document.getElementById(UI_ID)) {
    return;
  }

  const container = buildContainer(messages);
  anchor.insertAdjacentElement('afterend', container);

  try {
    const stats = await getReviewStats(asin, storage);
    renderStats(container, stats, { locale, messages });
  } catch (error) {
    renderError(container, error, messages);
  }
}

async function getReviewStats(asin: string, storage: StorageLike): Promise<ReviewStats> {
  const cacheKey = `${CACHE_PREFIX}:${location.origin}:${asin}`;
  const freshCache = readCache(storage, cacheKey);
  if (freshCache) {
    return freshCache;
  }

  const staleCache = readCache(storage, cacheKey, { allowExpired: true });

  try {
    const [allReviewData, verifiedReviewData, positiveVerifiedData, criticalVerifiedData] = await Promise.all([
      fetchReviewAggregate(asin, REVIEWER_TYPES.ALL),
      fetchReviewAggregate(asin, REVIEWER_TYPES.VERIFIED),
      fetchReviewAggregate(asin, REVIEWER_TYPES.VERIFIED, { filterByStar: STAR_FILTERS.POSITIVE }),
      fetchReviewAggregate(asin, REVIEWER_TYPES.VERIFIED, { filterByStar: STAR_FILTERS.CRITICAL })
    ]);

    if (allReviewData.count < verifiedReviewData.count) {
      throw new Error('Amazon returned inconsistent review aggregates.');
    }

    const stats: ReviewStats = {
      asin,
      allCount: allReviewData.count,
      verifiedCount: verifiedReviewData.count,
      verifiedRating: verifiedReviewData.rating,
      positiveVerifiedCount: positiveVerifiedData.count,
      criticalVerifiedCount: criticalVerifiedData.count,
      vineCount: allReviewData.count - verifiedReviewData.count,
      urls: {
        all: allReviewData.url,
        verified: verifiedReviewData.url,
        positive: positiveVerifiedData.url,
        critical: criticalVerifiedData.url
      },
      fetchedAt: Date.now()
    };

    writeCache(storage, cacheKey, stats);
    return stats;
  } catch (error) {
    if (staleCache) {
      return {
        ...staleCache,
        stale: true
      };
    }
    throw error;
  }
}

function readCache(storage: StorageLike, key: string, { allowExpired = false }: { allowExpired?: boolean } = {}) {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ReviewStats | null;
    if (!parsed || typeof parsed.fetchedAt !== 'number') {
      return null;
    }

    const isFresh = Date.now() - parsed.fetchedAt < CACHE_TTL_MS;
    if (!isFresh && !allowExpired) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCache(storage: StorageLike, key: string, value: ReviewStats) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota and privacy mode issues.
  }
}
