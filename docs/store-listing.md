# Store Listing Preparation

This note collects the exact values and files for the first public Chrome Web Store and Firefox Add-ons submissions.

## Release artifacts

Build the store upload files with one command:

- `npm run build:release`

Expected outputs in [`dist/release/`](../dist/release/):

- `better-reviews-for-amazon-chrome-0.4.0.zip`
- `better-reviews-for-amazon-firefox-0.4.0.xpi`

Both archives must contain these files at archive root:

- `manifest.json`
- `content.js`
- `_locales/`
- `icons/`

## Supported locales

The project currently ships these locales:

- `en`
- `de`
- `ru`

The browser-managed extension name and summary come from the localized files in [`src/i18n/locales/`](../src/i18n/locales/).

## Author and project links

The author data below was checked with GitHub CLI on 2026-04-06 by using `gh api user` and `gh repo view`.

- Author: Vitalii Rizo
- GitHub handle: `vrizo`
- GitHub profile: https://github.com/vrizo
- Public location: Berlin, Germany
- Repository: https://github.com/vrizo/better-reviews-for-amazon
- Homepage URL: https://github.com/vrizo/better-reviews-for-amazon
- Support URL: https://github.com/vrizo/better-reviews-for-amazon/issues
- Contribution URL: https://github.com/vrizo/better-reviews-for-amazon/pulls
- Support email: `vitalii.rizo@gmail.com`
- License: MIT
- Privacy policy URL: https://github.com/vrizo/better-reviews-for-amazon/blob/main/docs/privacy-policy.md
- Repository visibility: Public
- Promo video URL: https://youtu.be/i6ADZwzd3zc

## Shared listing copy

Use one shared long description across stores. The localized text lives in:

- [`src/i18n/locales/en.json`](../src/i18n/locales/en.json) at `marketplace.description`
- [`src/i18n/locales/de.json`](../src/i18n/locales/de.json) at `marketplace.description`
- [`src/i18n/locales/ru.json`](../src/i18n/locales/ru.json) at `marketplace.description`

Use the localized manifest description as the short summary.

### Name

- `en`: Better Reviews for Amazon
- `de`: Better Reviews for Amazon
- `ru`: Better Reviews for Amazon

### Summary

- `en`: Makes Amazon product reviews easier to trust and compare.
- `de`: Blendet unzuverlässige Bewertungen aus und erleichtert die Einschätzung von Produkten auf Amazon.
- `ru`: Скрывает недоверенные отзывы и упрощает оценку товаров в Amazon.

### Long description

#### English

Better Reviews for Amazon adds a small review summary box to Amazon product pages. It helps you quickly understand review quality by showing totals for verified purchase reviews only.

It excludes Vine reviews from rating calculations. Vine reviews are written by reviewers who receive products for free in exchange for feedback, which can make them less reliable.

The extension only works on Amazon pages. It runs locally in your browser, does not collect your data, does not send anything to a backend, and does not add referral links or tracking.

This open source project was created by Vitalii Rizo. Contributions are welcome on GitHub, including pull requests for translations and other small improvements. This project is not affiliated with Amazon and is not endorsed by Amazon.

#### German

Better Reviews for Amazon fügt auf Amazon-Produktseiten einen kleinen Block mit einer kurzen Zusammenfassung der Bewertungen hinzu. Er hilft, die Qualität der Bewertungen schnell einzuschätzen, indem nur Bewertungen mit verifiziertem Kauf angezeigt werden.

Die Erweiterung schließt Vine-Bewertungen aus der Berechnung der Bewertung aus. Vine-Bewertungen stammen von Nutzern, die Produkte kostenlos im Austausch für Feedback erhalten, daher können sie weniger zuverlässig sein.

Die Erweiterung funktioniert nur auf Amazon-Seiten. Sie läuft lokal in Ihrem Browser, sammelt keine Daten, sendet nichts an einen Server und fügt keine Affiliate-Links oder Tracking hinzu.

Dieses Open-Source-Projekt wurde von Vitalii Rizo erstellt. Beiträge auf GitHub sind willkommen, einschließlich Pull Requests mit Übersetzungen und anderen Verbesserungen. Das Projekt ist nicht mit Amazon verbunden und wurde nicht von Amazon genehmigt.

#### Russian

Better Reviews for Amazon добавляет небольшой блок с краткой сводкой отзывов на страницы товаров Amazon. Он помогает быстро оценить качество отзывов, показывая только отзывы с подтверждённой покупкой.

Расширение исключает отзывы Vine из расчёта рейтинга. Отзывы Vine пишут пользователи, которые получают товары бесплатно в обмен на обратную связь, поэтому они могут быть менее надёжными.

Расширение работает только на страницах Amazon. Оно выполняется локально в вашем браузере, не собирает данные, ничего не отправляет на сервер и не добавляет реферальные ссылки или трекинг.

Этот проект с открытым исходным кодом создан Vitalii Rizo. Приветствуются изменения на GitHub, включая pull request с переводами и другими улучшениями. Проект не связан с Amazon и не был одобрен Amazon.

## Chrome Web Store submission values

### Listing

- Item title: Better Reviews for Amazon
- Default language: English
- Localized languages to add: German, Russian
- Website: https://github.com/vrizo/better-reviews-for-amazon
- Support URL: https://github.com/vrizo/better-reviews-for-amazon/issues

Use these values:

- `en` summary: Makes Amazon product reviews easier to trust and compare.
- `de` summary: Blendet unzuverlässige Bewertungen aus und erleichtert die Einschätzung von Produkten auf Amazon.
- `ru` summary: Скрывает недоверенные отзывы и упрощает оценку товаров в Amazon.

Use the matching localized long descriptions from the section above.

### Promo video

- Global promo video URL: https://youtu.be/i6ADZwzd3zc

### Privacy answers

These answers match the current code in [`src/core/main.ts`](../src/core/main.ts) and [`src/core/amazon.ts`](../src/core/amazon.ts):

- Single purpose: Yes. The extension adds one review summary block on Amazon product pages.
- Data sale: No.
- Data use outside core functionality: No.
- Authentication info collected or transmitted: No.
- Personal communications collected or transmitted: No.
- Location collected or transmitted: No.
- Web history collected or transmitted: No.
- User activity collected or transmitted: No.
- Website content collected or transmitted to a remote server: No.
- Local processing only: Yes.
- Tracking: No.
- Ads or affiliate links: No.
- Remote code: No.

Behavior notes:

- The extension runs only on Amazon URLs declared in the manifest.
- It fetches Amazon review pages from the current Amazon origin with `credentials: "include"`.
- It stores cached review totals in browser local storage for 24 hours.
- It does not send data to any backend.
- Suggested privacy policy URL:
- https://github.com/vrizo/better-reviews-for-amazon/blob/main/docs/privacy-policy.md

### Distribution

- Visibility: Public
- Regions: All available

## Firefox Add-ons submission values

### Basic listing

- Add-on name: Better Reviews for Amazon
- Add-on URL slug: `better-reviews-for-amazon`
- Support email: `vitalii.rizo@gmail.com`
- Support website: https://github.com/vrizo/better-reviews-for-amazon/issues
- Homepage: https://github.com/vrizo/better-reviews-for-amazon
- License: MIT
- Desktop categories: `Shopping`, `Productivity`
- Android categories: `Shopping`, `Productivity`

### Localization

Add localized summary and description for:

- English
- German
- Russian

Use the matching text from the shared listing copy section.

### Reviewer notes

Use this reviewer note:

```text
This add-on is a content-script-only tool for Amazon product pages.

It injects a small review summary block below the product rating and reads review counts by fetching Amazon review filter pages from the same Amazon origin as the current page. The requests use the signed-in Amazon session already present in the browser. No data is sent to any external server.

The add-on stores cached review totals in browser local storage for 24 hours to reduce repeated Amazon requests. It does not include analytics, ads, affiliate links, remote code, or any background data collection.

Source code and build scripts:
https://github.com/vrizo/better-reviews-for-amazon
```

### Firefox manifest values

These values are expected in the generated Firefox manifest:

- Gecko ID: `better-reviews-for-amazon@vrizo.github`
- Data collection permissions: `required = ["none"]`

## Screenshot assets

Use the current `1280x800` screenshots from [`docs/images/`](../docs/images/):

- [`review-block-before-highlight.png`](../docs/images/review-block-before-highlight.png)
- [`review-block-after-highlight.png`](../docs/images/review-block-after-highlight.png)
- [`review-block-before-highlight-de.png`](../docs/images/review-block-before-highlight-de.png)
- [`review-block-after-highlight-de.png`](../docs/images/review-block-after-highlight-de.png)
- [`review-block-before-highlight-ru.png`](../docs/images/review-block-before-highlight-ru.png)
- [`review-block-after-highlight-ru.png`](../docs/images/review-block-after-highlight-ru.png)

Do not use promo images for the first submission unless a store step blocks on them.

## Upload asset paths

Chrome:

- Package: [`better-reviews-for-amazon-chrome-0.4.0.zip`](../dist/release/better-reviews-for-amazon-chrome-0.4.0.zip)
- Icon: [`icon-128.png`](../dist/chrome/icons/icon-128.png)
- Default screenshots:
- [`review-block-before-highlight.png`](../docs/images/review-block-before-highlight.png)
- [`review-block-after-highlight.png`](../docs/images/review-block-after-highlight.png)
- German screenshots:
- [`review-block-before-highlight-de.png`](../docs/images/review-block-before-highlight-de.png)
- [`review-block-after-highlight-de.png`](../docs/images/review-block-after-highlight-de.png)
- Russian screenshots:
- [`review-block-before-highlight-ru.png`](../docs/images/review-block-before-highlight-ru.png)
- [`review-block-after-highlight-ru.png`](../docs/images/review-block-after-highlight-ru.png)
- Promo video:
- https://youtu.be/i6ADZwzd3zc

Firefox:

- Package: [`better-reviews-for-amazon-firefox-0.4.0.xpi`](../dist/release/better-reviews-for-amazon-firefox-0.4.0.xpi)
- Icon: [`icon-128.png`](../dist/firefox/icons/icon-128.png)
- Default screenshots:
- [`review-block-before-highlight.png`](../docs/images/review-block-before-highlight.png)
- [`review-block-after-highlight.png`](../docs/images/review-block-after-highlight.png)
- German screenshots:
- [`review-block-before-highlight-de.png`](../docs/images/review-block-before-highlight-de.png)
- [`review-block-after-highlight-de.png`](../docs/images/review-block-after-highlight-de.png)
- Russian screenshots:
- [`review-block-before-highlight-ru.png`](../docs/images/review-block-before-highlight-ru.png)
- [`review-block-after-highlight-ru.png`](../docs/images/review-block-after-highlight-ru.png)

## Notes

- Default and localized screenshots match the preferred `1280x800` size.
- No separate privacy policy page is planned because the extension does not transmit user data.
- If a store validator or reviewer requests a different field value, update this file with the accepted value after submission.

## Sources

Official sources used for this note:

- Chrome Web Store publish flow: https://developer.chrome.com/docs/webstore/publish/
- Chrome listing guidance: https://developer.chrome.com/docs/webstore/best-listing
- Chrome image requirements: https://developer.chrome.com/docs/webstore/images
- Chrome privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Chrome listing requirements: https://developer.chrome.com/docs/webstore/program-policies/listing-requirements
- Chrome developer account setup: https://developer.chrome.com/docs/webstore/set-up-account
- Firefox submission fields: https://extensionworkshop.com/documentation/publish/submitting-an-add-on/
- Firefox listing guidance: https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/
- Firefox built-in consent for data collection and transmission: https://www.extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
- Firefox add-on ownership: https://extensionworkshop.com/documentation/publish/add-on-ownership/
