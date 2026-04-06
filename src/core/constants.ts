export const CACHE_PREFIX = 'better-reviews-for-amazon:v1';
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const UI_ID = 'better-reviews-for-amazon-extra';

export const REVIEWER_TYPES = Object.freeze({
  ALL: 'all_reviews',
  VERIFIED: 'avp_only_reviews'
});

export const STAR_FILTERS = Object.freeze({
  POSITIVE: 'positive',
  CRITICAL: 'critical'
});
