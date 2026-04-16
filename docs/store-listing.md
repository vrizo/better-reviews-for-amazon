# Store Listing Preparation

This note collects the store fields and the shared copy that is ready to paste for publication.

## Supported locales

The project currently ships these locales:

- `en`
- `de`
- `ru`

The browser-managed extension name and short summary already come from the localized files in [`src/i18n/locales/`](../src/i18n/locales/).

## Author and project links

The author data below was checked with GitHub CLI on 2026-04-06 by using `gh api user` and `gh repo view`.

- Author: Vitalii Rizo
- GitHub handle: `vrizo`
- GitHub profile: https://github.com/vrizo
- Public location: Berlin, Germany
- Repository: https://github.com/vrizo/better-reviews-for-amazon
- Pull requests: https://github.com/vrizo/better-reviews-for-amazon/pulls
- Issues: https://github.com/vrizo/better-reviews-for-amazon/issues
- Translation files: https://github.com/vrizo/better-reviews-for-amazon/tree/main/src/i18n/locales

## Shared listing copy

Use one shared long description across stores. The localized text lives in:

- [`src/i18n/locales/en.json`](../src/i18n/locales/en.json) at `marketplace.description`
- [`src/i18n/locales/de.json`](../src/i18n/locales/de.json) at `marketplace.description`
- [`src/i18n/locales/ru.json`](../src/i18n/locales/ru.json) at `marketplace.description`

Use the localized manifest description as the short summary:

- `en`: Makes product reviews look more trustworthy on Amazon pages.
- `de`: Lässt Produktbewertungen auf Amazon-Seiten vertrauenswürdiger wirken.
- `ru`: Делает отзывы о товарах на страницах Amazon более заслуживающими доверия.

Ready-to-paste long descriptions:

### English

Better Reviews for Amazon adds a small review summary block to Amazon product pages. It helps you read review quality signals faster by showing verified purchase review totals, positive verified reviews, critical verified reviews, and Vine reviews in one place.

The tool only works on Amazon pages. It runs locally in the browser, does not collect user data, does not send data to a backend, and does not add referral links or tracking.

This open source project was created by Vitalii Rizo. Contributions are welcome on GitHub, including pull requests for translations and other small improvements. This project is not affiliated with or endorsed by Amazon.

### German

Better Reviews for Amazon fügt Amazon-Produktseiten einen kleinen Bewertungsblock hinzu. Damit lassen sich wichtige Qualitätssignale schneller lesen, weil Bewertungen mit verifiziertem Kauf, positive Bewertungen, kritische Bewertungen und Vine-Bewertungen an einer Stelle zusammengefasst werden.

Das Tool funktioniert nur auf Amazon-Seiten. Es läuft lokal im Browser, sammelt keine Nutzerdaten, sendet nichts an ein Backend und fügt keine Referral-Links oder kein Tracking hinzu.

Dieses Open-Source-Projekt wurde von Vitalii Rizo erstellt. Beiträge auf GitHub sind willkommen, zum Beispiel Pull Requests für Übersetzungen und andere kleine Verbesserungen. Dieses Projekt ist weder mit Amazon verbunden noch von Amazon unterstützt.

### Russian

Better Reviews for Amazon добавляет небольшой блок со сводкой отзывов на страницы товаров Amazon. Он помогает быстрее оценить качество отзывов, показывая в одном месте количество отзывов с подтверждённой покупкой, положительные отзывы, критические отзывы и отзывы Vine.

Инструмент работает только на страницах Amazon. Он выполняется локально в браузере, не собирает пользовательские данные, не отправляет данные на сервер и не добавляет реферальные ссылки или трекинг.

Это open source проект, созданный Vitalii Rizo. Вклад через GitHub приветствуется, например pull request с переводами и другими небольшими улучшениями. Проект не связан с Amazon и не одобрен Amazon.

The long description already includes:

- what the tool does
- the privacy-safe scope
- the author name
- the GitHub contribution invitation
- the Amazon non-affiliation note

## Store fields

### Chrome Web Store

Prepare these fields before first publication:

- Publisher name in the developer account
- Verified developer account email
- Store listing tab
- Privacy tab
- Distribution tab

Prepare these listing assets and texts:

- Item title
- Item summary, 132 characters or less
- Item description
- Store icon
- At least 1 screenshot, up to 5 total
- Optional website URL
- Optional support URL
- Optional promo images

Important notes:

- The summary should also work as the browser-visible extension description.
- Locale-specific strings are supported for the summary.
- The listing can be rejected if description, icon, or screenshots are missing.
- Screenshot requirements:
- Use square corners and no padding.
- Use `1280x800` or `640x400`.
- `1280x800` is preferred.
- Screenshots should show the real user experience and current functionality.

### Firefox Add-ons

Prepare these listing fields in AMO:

- Name
- Add-on URL slug
- Summary
- Description
- Up to 2 Firefox categories
- Up to 2 Firefox for Android categories
- Support email
- Support website
- License
- Privacy policy only if data is transmitted
- Notes for reviewers

Important notes:

- The summary limit is 250 characters.
- You can localize almost all listing text, including the add-on name.
- AMO supports multiple authors through owners and developers.
- Screenshot guidance:
- There is no practical limit to the number of screenshots, but each one should show a key feature.
- You can upload only one screenshot set for the listing, but localize screenshot descriptions.
- Mozilla recommends `1280x800` as the maximum display size.
- For other sizes, Mozilla recommends keeping the `1.6:1` ratio.

### Microsoft Edge Add-ons

Prepare these language-specific fields in Partner Center:

- Description, required for each language
- Extension logo, required for each language
- Extension name, required for at least one language
- Short description, required for at least one language

Optional fields:

- Small promotional tile
- Large promotional tile
- Up to 6 screenshots
- YouTube video URL
- Search terms

Important notes:

- Description length must be 250 to 10,000 characters.
- The current manifest localization setup is compatible with Edge locale detection because it uses `__MSG_...__` placeholders and `_locales` files.
- Screenshot requirements:
- Up to 6 screenshots.
- Use `640x480` or `1280x800`.
- One screenshot set can be duplicated to all languages from Partner Center.

## Shared screenshot plan

Use one English screenshot set for all supported listing languages.

- Recommended common size for all three stores: `1280x800`
- Why this size:
- Chrome officially prefers `1280x800`
- Firefox officially recommends `1280x800`
- Edge officially accepts `1280x800`
- Keep the screenshots in English and duplicate them across locales where the store allows it.
- Anonymize all account and listing details before capture:
- replace product title and seller text with fake values
- hide cart state and delivery address
- strongly blur the product image
- keep only the extension-related review area readable

## Suggested store values

These values are ready now:

- Name: Better Reviews for Amazon
- Author display: Vitalii Rizo
- Homepage URL: https://github.com/vrizo/better-reviews-for-amazon
- Support URL: https://github.com/vrizo/better-reviews-for-amazon/issues
- Contribution URL: https://github.com/vrizo/better-reviews-for-amazon/pulls

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
- Firefox add-on ownership: https://extensionworkshop.com/documentation/publish/add-on-ownership/
- Microsoft Edge submission and store listings: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
