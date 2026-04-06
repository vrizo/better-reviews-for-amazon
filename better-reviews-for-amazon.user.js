// ==UserScript==
// @name         Better Reviews for Amazon
// @namespace    https://openai.com/codex
// @version      0.4.0
// @description  Shows better review signals on Amazon product pages.
// @include      /^https:\/\/(www\.)?amazon\.[^/]+\/.*$/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

"use strict";
(() => {
  // src/core/amazon.ts
  function getAsin() {
    const inputAsin = document.querySelector('#ASIN, input[name="ASIN"]')?.value?.trim();
    if (isValidAsin(inputAsin)) {
      return String(inputAsin).toUpperCase();
    }
    const dataAsin = document.querySelector("#averageCustomerReviews[data-asin]")?.getAttribute("data-asin")?.trim();
    if (isValidAsin(dataAsin)) {
      return String(dataAsin).toUpperCase();
    }
    const match = location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
    return isValidAsin(match?.[1]) ? match[1].toUpperCase() : null;
  }
  function isValidAsin(value) {
    return /^[A-Z0-9]{10}$/i.test(value ?? "");
  }
  async function waitForAnchor(timeoutMs = 15e3) {
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
  function findAnchor() {
    return document.querySelector("#averageCustomerReviews_feature_div #averageCustomerReviews") || document.querySelector("#averageCustomerReviews");
  }
  async function fetchReviewAggregate(asin, reviewerType, { filterByStar = null } = {}) {
    const url = buildReviewUrl(asin, reviewerType, { filterByStar });
    const response = await fetch(url, {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error(`Review page request failed for ${reviewerType} (${response.status}).`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const countText = doc.querySelector('#filter-info-section [data-hook="cr-filter-info-review-rating-count"]')?.textContent?.trim();
    const count = parseCount(countText);
    const ratingText = doc.querySelector('[data-hook="rating-out-of-text"]')?.textContent?.trim() || doc.querySelector('[data-hook="average-star-rating"]')?.textContent?.trim() || "";
    const rating = parseRating(ratingText);
    if (count === null) {
      if (looksLikeLoginGate(doc)) {
        throw new Error("Amazon review stats require a signed-in session.");
      }
      throw new Error(`Could not find review count for ${reviewerType}${filterByStar ? `/${filterByStar}` : ""}.`);
    }
    return {
      count,
      rating,
      url
    };
  }
  function buildReviewUrl(asin, reviewerType, { filterByStar = null } = {}) {
    const localePrefixMatch = location.pathname.match(/^\/-\/[^/]+\//);
    const localePrefix = localePrefixMatch ? localePrefixMatch[0] : "/";
    const ref = filterByStar ? "cm_cr_arp_d_viewopt_sr" : "cm_cr_arp_d_viewopt_rvwer";
    const params = new URLSearchParams({
      reviewerType,
      pageNumber: "1"
    });
    if (filterByStar) {
      params.set("filterByStar", filterByStar);
    }
    const relativeUrl = `${localePrefix}product-reviews/${asin}/ref=${ref}?${params.toString()}`;
    return new URL(relativeUrl, location.origin).toString();
  }
  function parseCount(text) {
    if (!text) {
      return null;
    }
    const match = text.match(/[\d][\d.,\s\u00A0\u202F]*/);
    if (!match) {
      return null;
    }
    const digitsOnly = match[0].replace(/\D/g, "");
    if (!digitsOnly) {
      return null;
    }
    return Number(digitsOnly);
  }
  function parseRating(text) {
    if (!text) {
      return null;
    }
    const match = text.match(/\d+(?:[.,]\d+)?/);
    if (!match) {
      return null;
    }
    return Number(match[0].replace(",", "."));
  }
  function looksLikeLoginGate(doc) {
    return Boolean(
      doc.querySelector('form[name="signIn"]') || doc.querySelector('input[name="email"]') || /sign in|anmelden/i.test(doc.title || "")
    );
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // src/core/constants.ts
  var CACHE_PREFIX = "better-reviews-for-amazon:v1";
  var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
  var UI_ID = "better-reviews-for-amazon-extra";
  var REVIEWER_TYPES = Object.freeze({
    ALL: "all_reviews",
    VERIFIED: "avp_only_reviews"
  });
  var STAR_FILTERS = Object.freeze({
    POSITIVE: "positive",
    CRITICAL: "critical"
  });

  // src/core/ui.ts
  function buildContainer() {
    const container = document.createElement("div");
    container.id = UI_ID;
    container.className = "a-row a-spacing-small";
    container.style.marginTop = "4px";
    const loading = document.createElement("span");
    loading.className = "a-size-small a-color-secondary";
    loading.textContent = "Loading review stats...";
    container.appendChild(loading);
    return container;
  }
  function renderStats(container, stats) {
    container.replaceChildren();
    const verifiedRow = makeRow();
    verifiedRow.appendChild(makeLinkedLabel("Verified purchase reviews", stats.urls.verified));
    verifiedRow.appendChild(document.createTextNode(": "));
    verifiedRow.appendChild(makeBoldText(formatVerifiedSummary(stats.verifiedRating, stats.verifiedCount)));
    const sentimentRow = makeRow();
    sentimentRow.appendChild(makeInlineLinkedStat("Critical reviews", stats.criticalVerifiedCount, stats.urls.critical));
    sentimentRow.appendChild(makeSeparator());
    sentimentRow.appendChild(makeInlineLinkedStat("Positive reviews", stats.positiveVerifiedCount, stats.urls.positive));
    const vineRow = makeRow();
    vineRow.appendChild(makeTextStat("Vine reviews", stats.vineCount));
    if (stats.stale) {
      vineRow.appendChild(makeSeparator());
      const stale = document.createElement("span");
      stale.className = "a-color-secondary";
      stale.title = "Showing cached data because the live review pages were unavailable.";
      stale.textContent = "cached";
      vineRow.appendChild(stale);
    }
    container.append(verifiedRow, sentimentRow, vineRow);
  }
  function renderError(container, error) {
    container.replaceChildren();
    const message = document.createElement("span");
    message.className = "a-size-small a-color-secondary";
    message.title = error instanceof Error ? error.message : "Unknown error";
    message.textContent = error instanceof Error && /signed-in session/i.test(error.message) ? "Review stats unavailable: sign in required" : "Review stats unavailable";
    container.appendChild(message);
  }
  function makeLinkedLabel(label, href) {
    const link = document.createElement("a");
    link.className = "a-link-normal";
    link.href = href;
    link.textContent = label;
    return link;
  }
  function makeInlineLinkedStat(label, value, href) {
    const wrapper = document.createElement("span");
    wrapper.append(makeLinkedLabel(label, href), document.createTextNode(": "), makeBoldText(formatCount(value)));
    return wrapper;
  }
  function makeTextStat(label, value) {
    const wrapper = document.createElement("span");
    const labelNode = document.createElement("span");
    labelNode.textContent = `${label}: `;
    wrapper.append(labelNode, makeBoldText(formatCount(value)));
    return wrapper;
  }
  function makeBoldText(text) {
    const value = document.createElement("span");
    value.className = "a-color-base a-text-bold";
    value.textContent = text;
    return value;
  }
  function makeRow() {
    const row = document.createElement("div");
    row.className = "a-size-small a-color-secondary";
    row.style.lineHeight = "1.4";
    return row;
  }
  function makeSeparator() {
    const separator = document.createElement("span");
    separator.className = "a-color-secondary";
    separator.style.margin = "0 6px";
    separator.textContent = "|";
    return separator;
  }
  function formatCount(value) {
    const locale = document.documentElement.lang || void 0;
    return new Intl.NumberFormat(locale).format(value);
  }
  function formatRating(value) {
    const locale = document.documentElement.lang || void 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }
  function formatVerifiedSummary(rating, count) {
    return typeof rating !== "number" || Number.isNaN(rating) ? `(${formatCount(count)})` : `${formatRating(rating)} (${formatCount(count)})`;
  }

  // src/core/main.ts
  function runBetterReviews({
    storage = window.localStorage,
    logPrefix = "[better-reviews-for-amazon]"
  } = {}) {
    init(storage).catch((error) => {
      console.error(logPrefix, error);
    });
  }
  async function init(storage) {
    const asin = getAsin();
    if (!asin) {
      return;
    }
    const anchor = await waitForAnchor();
    if (!anchor || document.getElementById(UI_ID)) {
      return;
    }
    const container = buildContainer();
    anchor.insertAdjacentElement("afterend", container);
    try {
      const stats = await getReviewStats(asin, storage);
      renderStats(container, stats);
    } catch (error) {
      renderError(container, error);
    }
  }
  async function getReviewStats(asin, storage) {
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
        throw new Error("Amazon returned inconsistent review aggregates.");
      }
      const stats = {
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
  function readCache(storage, key, { allowExpired = false } = {}) {
    try {
      const raw = storage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.fetchedAt !== "number") {
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
  function writeCache(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }

  // src/userscript/index.ts
  runBetterReviews();
})();
