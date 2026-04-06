import type { ReviewAggregate } from './types';

export function getAsin() {
  const inputAsin = document.querySelector<HTMLInputElement>('#ASIN, input[name="ASIN"]')?.value?.trim();
  if (isValidAsin(inputAsin)) {
    return String(inputAsin).toUpperCase();
  }

  const dataAsin = document.querySelector('#averageCustomerReviews[data-asin]')?.getAttribute('data-asin')?.trim();
  if (isValidAsin(dataAsin)) {
    return String(dataAsin).toUpperCase();
  }

  const match = location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return isValidAsin(match?.[1]) ? match![1].toUpperCase() : null;
}

export function isValidAsin(value: string | null | undefined) {
  return /^[A-Z0-9]{10}$/i.test(value ?? '');
}

export async function waitForAnchor(timeoutMs = 15_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const anchor = findAnchor();
    if (anchor) {
      return anchor;
    }
    await sleep(250);
  }
  return null;
}

export function findAnchor() {
  return (
    document.querySelector<HTMLElement>('#averageCustomerReviews_feature_div #averageCustomerReviews') ||
    document.querySelector<HTMLElement>('#averageCustomerReviews')
  );
}

export async function fetchReviewAggregate(
  asin: string,
  reviewerType: string,
  { filterByStar = null }: { filterByStar?: string | null } = {}
): Promise<ReviewAggregate> {
  const url = buildReviewUrl(asin, reviewerType, { filterByStar });
  const response = await fetch(url, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Review page request failed for ${reviewerType} (${response.status}).`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const countText = doc
    .querySelector('#filter-info-section [data-hook="cr-filter-info-review-rating-count"]')
    ?.textContent?.trim();
  const count = parseCount(countText);
  const ratingText =
    doc.querySelector('[data-hook="rating-out-of-text"]')?.textContent?.trim() ||
    doc.querySelector('[data-hook="average-star-rating"]')?.textContent?.trim() ||
    '';
  const rating = parseRating(ratingText);

  if (count === null) {
    if (looksLikeLoginGate(doc)) {
      throw new Error('Amazon review stats require a signed-in session.');
    }
    throw new Error(`Could not find review count for ${reviewerType}${filterByStar ? `/${filterByStar}` : ''}.`);
  }

  return {
    count,
    rating,
    url
  };
}

function buildReviewUrl(asin: string, reviewerType: string, { filterByStar = null }: { filterByStar?: string | null } = {}) {
  const localePrefixMatch = location.pathname.match(/^\/-\/[^/]+\//);
  const localePrefix = localePrefixMatch ? localePrefixMatch[0] : '/';
  const ref = filterByStar ? 'cm_cr_arp_d_viewopt_sr' : 'cm_cr_arp_d_viewopt_rvwer';
  const params = new URLSearchParams({
    reviewerType,
    pageNumber: '1'
  });

  if (filterByStar) {
    params.set('filterByStar', filterByStar);
  }

  const relativeUrl = `${localePrefix}product-reviews/${asin}/ref=${ref}?${params.toString()}`;
  return new URL(relativeUrl, location.origin).toString();
}

function parseCount(text: string | undefined) {
  if (!text) {
    return null;
  }

  const match = text.match(/[\d][\d.,\s\u00A0\u202F]*/);
  if (!match) {
    return null;
  }

  const digitsOnly = match[0].replace(/\D/g, '');
  if (!digitsOnly) {
    return null;
  }

  return Number(digitsOnly);
}

function parseRating(text: string) {
  if (!text) {
    return null;
  }

  const match = text.match(/\d+(?:[.,]\d+)?/);
  if (!match) {
    return null;
  }

  return Number(match[0].replace(',', '.'));
}

function looksLikeLoginGate(doc: Document) {
  return Boolean(
    doc.querySelector('form[name="signIn"]') ||
      doc.querySelector('input[name="email"]') ||
      /sign in|anmelden/i.test(doc.title || '')
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
