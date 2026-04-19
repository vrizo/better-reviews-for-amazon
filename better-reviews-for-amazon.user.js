// ==UserScript==
// @name         Better Reviews for Amazon
// @namespace    https://github.com/vrizo/better-reviews-for-amazon
// @author       Vitalii Rizo (https://github.com/vrizo)
// @version      0.4.0
// @description  Makes Amazon product reviews easier to trust and compare.
// @license      MIT
// @name:de    Better Reviews for Amazon
// @description:de Blendet unzuverlässige Bewertungen aus und erleichtert die Einschätzung von Produkten auf Amazon.
// @name:ru    Better Reviews for Amazon
// @description:ru Скрывает недоверенные отзывы и упрощает оценку товаров в Amazon.
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
        "description": "Blendet unzuverlässige Bewertungen aus und erleichtert die Einschätzung von Produkten auf Amazon."
      },
      "marketplace": {
        "description": "Better Reviews for Amazon fügt auf Amazon-Produktseiten einen kleinen Block mit einer kurzen Zusammenfassung der Bewertungen hinzu. Er hilft, die Qualität der Bewertungen schnell einzuschätzen, indem nur Bewertungen mit verifiziertem Kauf angezeigt werden.\n\nDie Erweiterung schließt Vine-Bewertungen aus der Berechnung der Bewertung aus. Vine-Bewertungen stammen von Nutzern, die Produkte kostenlos im Austausch für Feedback erhalten, daher können sie weniger zuverlässig sein.\n\nDie Erweiterung funktioniert nur auf Amazon-Seiten. Sie läuft lokal in Ihrem Browser, sammelt keine Daten, sendet nichts an einen Server und fügt keine Affiliate-Links oder Tracking hinzu.\n\nDieses Open-Source-Projekt wurde von Vitalii Rizo erstellt. Beiträge auf GitHub sind willkommen, einschließlich Pull Requests mit Übersetzungen und anderen Verbesserungen. Das Projekt ist nicht mit Amazon verbunden und wurde nicht von Amazon genehmigt."
      },
      "ui": {
        "loading": "Lade Bewertungsstatistiken…",
        "verifiedPurchaseReviews": "Bewertungen mit verifiziertem Kauf",
        "criticalReviews": "Negative Bewertungen",
        "positiveReviews": "Positive Bewertungen",
        "vineReviews": "Vine-Bewertungen",
        "cachedLabel": "zwischengespeichert",
        "cachedTitle": "Zwischengespeicherte Daten werden angezeigt, da die Bewertungsseiten derzeit nicht verfügbar sind.",
        "errorUnavailable": "Bewertungsstatistiken nicht verfügbar",
        "errorSignInRequired": "Bewertungsstatistiken nicht verfügbar, Anmeldung erforderlich"
      }
    },
    "en": {
      "meta": {
        "name": "Better Reviews for Amazon",
        "description": "Makes Amazon product reviews easier to trust and compare."
      },
      "marketplace": {
        "description": "Better Reviews for Amazon adds a small review summary box to Amazon product pages. It helps you quickly understand review quality by showing totals for verified purchase reviews only.\n\nIt excludes Vine reviews from rating calculations. Vine reviews are written by reviewers who receive products for free in exchange for feedback, which can make them less reliable.\n\nThe extension only works on Amazon pages. It runs locally in your browser, does not collect your data, does not send anything to a backend, and does not add referral links or tracking.\n\nThis open source project was created by Vitalii Rizo. Contributions are welcome on GitHub, including pull requests for translations and other small improvements. This project is not affiliated with Amazon and is not endorsed by Amazon."
      },
      "ui": {
        "loading": "Loading review stats…",
        "verifiedPurchaseReviews": "Verified purchase reviews",
        "criticalReviews": "Critical reviews",
        "positiveReviews": "Positive reviews",
        "vineReviews": "Vine reviews",
        "cachedLabel": "cached",
        "cachedTitle": "Showing cached data because the live review pages were not available.",
        "errorUnavailable": "Review stats not available",
        "errorSignInRequired": "Review stats not available, sign-in required"
      }
    },
    "ru": {
      "meta": {
        "name": "Better Reviews for Amazon",
        "description": "Скрывает недоверенные отзывы и упрощает оценку товаров в Amazon."
      },
      "marketplace": {
        "description": "Better Reviews for Amazon добавляет небольшой блок с краткой сводкой отзывов на страницы товаров Amazon. Он помогает быстро оценить качество отзывов, показывая только отзывы с подтверждённой покупкой.\n\nРасширение исключает отзывы Vine из расчёта рейтинга. Отзывы Vine пишут пользователи, которые получают товары бесплатно в обмен на обратную связь, поэтому они могут быть менее надёжными.\n\nРасширение работает только на страницах Amazon. Оно выполняется локально в вашем браузере, не собирает данные, ничего не отправляет на сервер и не добавляет реферальные ссылки или трекинг.\n\nЭтот проект с открытым исходным кодом создан Vitalii Rizo. Приветствуются изменения на GitHub, включая pull request с переводами и другими улучшениями. Проект не связан с Amazon и не был одобрен Amazon."
      },
      "ui": {
        "loading": "Загрузка статистики отзывов…",
        "verifiedPurchaseReviews": "Отзывы с подтверждённой покупкой",
        "criticalReviews": "Негативные отзывы",
        "positiveReviews": "Положительные отзывы",
        "vineReviews": "Отзывы Vine",
        "cachedLabel": "кэшировано",
        "cachedTitle": "Показаны кэшированные данные, так как страницы с отзывами сейчас недоступны.",
        "errorUnavailable": "Статистика отзывов недоступна",
        "errorSignInRequired": "Статистика отзывов недоступна, требуется вход в аккаунт"
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
