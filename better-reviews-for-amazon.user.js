// ==UserScript==
// @name         Better Reviews for Amazon
// @namespace    https://openai.com/codex
// @version      0.4.0
// @description  Makes product reviews look more trustworthy on Amazon pages.
// @name:de    Better Reviews for Amazon
// @description:de Lässt Produktbewertungen auf Amazon-Seiten vertrauenswürdiger wirken.
// @name:ru    Better Reviews for Amazon
// @description:ru Делает отзывы о товарах на страницах Amazon более заслуживающими доверия.
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
    const matches = text.match(/\d[\d.,\s\u00A0\u202F]*/gu);
    if (!matches) {
      return null;
    }
    let largestValue = null;
    for (const match of matches) {
      const digitsOnly = match.replace(/\D/gu, "");
      if (!digitsOnly) {
        continue;
      }
      const value = Number(digitsOnly);
      if (!Number.isFinite(value)) {
        continue;
      }
      largestValue = largestValue === null ? value : Math.max(largestValue, value);
    }
    return largestValue;
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
  function buildContainer(messages) {
    const container = document.createElement("div");
    container.id = UI_ID;
    container.className = "a-row a-spacing-small";
    container.style.marginTop = "4px";
    const loading = document.createElement("span");
    loading.className = "a-size-small a-color-secondary";
    loading.textContent = messages.loading;
    container.appendChild(loading);
    return container;
  }
  function renderStats(container, stats, { locale, messages }) {
    container.replaceChildren();
    const verifiedRow = makeRow();
    verifiedRow.appendChild(makeLinkedLabel(messages.verifiedPurchaseReviews, stats.urls.verified));
    verifiedRow.appendChild(document.createTextNode(": "));
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
      const stale = document.createElement("span");
      stale.className = "a-color-secondary";
      stale.title = messages.cachedTitle;
      stale.textContent = messages.cachedLabel;
      vineRow.appendChild(stale);
    }
    container.append(verifiedRow, sentimentRow, vineRow);
  }
  function renderError(container, error, messages) {
    container.replaceChildren();
    const isSignInRequired = error instanceof Error && /signed-in session/i.test(error.message);
    const message = document.createElement("span");
    message.className = "a-size-small a-color-secondary";
    message.title = isSignInRequired ? messages.errorSignInRequired : messages.errorUnavailable;
    message.textContent = isSignInRequired ? messages.errorSignInRequired : messages.errorUnavailable;
    container.appendChild(message);
  }
  function makeLinkedLabel(label, href) {
    const link = document.createElement("a");
    link.className = "a-link-normal";
    link.href = href;
    link.textContent = label;
    return link;
  }
  function makeInlineLinkedStat(label, value, href, locale) {
    const wrapper = document.createElement("span");
    wrapper.append(makeLinkedLabel(label, href), document.createTextNode(": "), makeBoldText(formatCount(value, locale)));
    return wrapper;
  }
  function makeTextStat(label, value, locale) {
    const wrapper = document.createElement("span");
    const labelNode = document.createElement("span");
    labelNode.textContent = `${label}: `;
    wrapper.append(labelNode, makeBoldText(formatCount(value, locale)));
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
  function formatCount(value, locale) {
    return new Intl.NumberFormat(locale).format(value);
  }
  function formatRating(value, locale) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }
  function formatVerifiedSummary(rating, count, locale) {
    return typeof rating !== "number" || Number.isNaN(rating) ? `(${formatCount(count, locale)})` : `${formatRating(rating, locale)} (${formatCount(count, locale)})`;
  }

  // src/i18n/generated.ts
  var defaultLocale = "en";
  var localeCatalog = {
    "de": {
      "meta": {
        "name": "Better Reviews for Amazon",
        "description": "L\xE4sst Produktbewertungen auf Amazon-Seiten vertrauensw\xFCrdiger wirken."
      },
      "ui": {
        "loading": "Bewertungsdaten werden geladen\u2026",
        "verifiedPurchaseReviews": "Bewertungen mit verifiziertem Kauf",
        "criticalReviews": "Kritische Bewertungen",
        "positiveReviews": "Positive Bewertungen",
        "vineReviews": "Vine-Bewertungen",
        "cachedLabel": "Cache",
        "cachedTitle": "Zwischengespeicherte Daten werden angezeigt, weil die Live-Bewertungsseiten nicht verf\xFCgbar waren.",
        "errorUnavailable": "Bewertungsdaten nicht verf\xFCgbar",
        "errorSignInRequired": "Bewertungsdaten nicht verf\xFCgbar \u2014 Anmeldung erforderlich"
      }
    },
    "en": {
      "meta": {
        "name": "Better Reviews for Amazon",
        "description": "Makes product reviews look more trustworthy on Amazon pages."
      },
      "ui": {
        "loading": "Loading review stats\u2026",
        "verifiedPurchaseReviews": "Verified purchase reviews",
        "criticalReviews": "Critical reviews",
        "positiveReviews": "Positive reviews",
        "vineReviews": "Vine reviews",
        "cachedLabel": "cached",
        "cachedTitle": "Showing cached data because the live review pages were unavailable.",
        "errorUnavailable": "Review stats unavailable",
        "errorSignInRequired": "Review stats unavailable \u2014 sign in required"
      }
    },
    "ru": {
      "meta": {
        "name": "Better Reviews for Amazon",
        "description": "\u0414\u0435\u043B\u0430\u0435\u0442 \u043E\u0442\u0437\u044B\u0432\u044B \u043E \u0442\u043E\u0432\u0430\u0440\u0430\u0445 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430\u0445 Amazon \u0431\u043E\u043B\u0435\u0435 \u0437\u0430\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u044E\u0449\u0438\u043C\u0438 \u0434\u043E\u0432\u0435\u0440\u0438\u044F."
      },
      "ui": {
        "loading": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0442\u0437\u044B\u0432\u043E\u0432\u2026",
        "verifiedPurchaseReviews": "\u041E\u0442\u0437\u044B\u0432\u044B \u0441 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u043E\u0439 \u043F\u043E\u043A\u0443\u043F\u043A\u043E\u0439",
        "criticalReviews": "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0442\u0437\u044B\u0432\u044B",
        "positiveReviews": "\u041F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u0442\u0437\u044B\u0432\u044B",
        "vineReviews": "\u041E\u0442\u0437\u044B\u0432\u044B Vine",
        "cachedLabel": "\u043A\u044D\u0448",
        "cachedTitle": "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0437 \u043A\u044D\u0448\u0430, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u043E\u0442\u0437\u044B\u0432\u043E\u0432 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.",
        "errorUnavailable": "\u0414\u0430\u043D\u043D\u044B\u0435 \u043E\u0442\u0437\u044B\u0432\u043E\u0432 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B",
        "errorSignInRequired": "\u0414\u0430\u043D\u043D\u044B\u0435 \u043E\u0442\u0437\u044B\u0432\u043E\u0432 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u2014 \u043D\u0443\u0436\u0435\u043D \u0432\u0445\u043E\u0434 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442"
      }
    }
  };

  // src/i18n/runtime.ts
  function getLocaleMessages(locale) {
    return localeCatalog[locale];
  }
  function resolveAmazonPageLocale(doc = document) {
    return normalizeLocaleTag(doc.documentElement.getAttribute("lang")) ?? normalizeLocaleTag(readLocaleFromPath(doc.location?.pathname ?? location.pathname)) ?? defaultLocale;
  }
  function normalizeLocaleTag(locale) {
    if (!locale) {
      return null;
    }
    const normalized = locale.trim().toLowerCase().replace(/_/gu, "-");
    if (!normalized) {
      return null;
    }
    if (normalized in localeCatalog) {
      return normalized;
    }
    const baseLocale = normalized.split("-")[0];
    return baseLocale in localeCatalog ? baseLocale : null;
  }
  function readLocaleFromPath(pathname) {
    return pathname.match(/^\/-\/([a-z]{2}(?:-[a-z]{2})?)\//iu)?.[1] ?? null;
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
    const locale = resolveAmazonPageLocale();
    const messages = getLocaleMessages(locale).ui;
    const anchor = await waitForAnchor();
    if (!anchor || document.getElementById(UI_ID)) {
      return;
    }
    const container = buildContainer(messages);
    anchor.insertAdjacentElement("afterend", container);
    try {
      const stats = await getReviewStats(asin, storage);
      renderStats(container, stats, { locale, messages });
    } catch (error) {
      renderError(container, error, messages);
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
