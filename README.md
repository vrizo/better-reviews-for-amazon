# Better Reviews for Amazon

[![Better Reviews for Amazon](https://img.shields.io/badge/Better%20Reviews%20for%20Amazon-Install%20from%20Greasy%20Fork-ff9800?style=for-the-badge)](https://greasyfork.org/en/scripts/574410-better-reviews-for-amazon)

Open source tools for better review signals on Amazon pages.

Right now this repo contains one userscript and the shared source for browser extensions.
Later it will also contain:

- a Chrome extension
- a Firefox extension

All versions follow the same rules:

- only work on Amazon pages
- do not collect user data
- do not send data to a backend
- do not add referral links
- do not change checkout or account pages

## Current tool

The current userscript adds a small review block under the product rating.

It shows:

- verified purchase rating and count
- positive verified reviews
- critical verified reviews
- Vine reviews

The injected block follows the Amazon page language.
Extension metadata follows the browser language when a translation is available.

## Install

1. Install Tampermonkey or Violentmonkey.
2. Open the Greasy Fork install page: [Better Reviews for Amazon on Greasy Fork](https://greasyfork.org/en/scripts/574410-better-reviews-for-amazon).
3. Click `Install this script`.
4. Alternative: open [`better-reviews-for-amazon.user.js`](./better-reviews-for-amazon.user.js) and install it in your userscript manager.

## Development

- Shared Amazon logic lives in [`src/core/`](./src/core/).
- Thin entry points live in [`src/userscript/`](./src/userscript/), [`src/chrome-extension/`](./src/chrome-extension/), and [`src/firefox-extension/`](./src/firefox-extension/).
- Chrome and Firefox manifests are generated from one shared base.
- All shared translations live in [`src/i18n/locales/`](./src/i18n/locales/).
- Add a new locale by creating one more JSON file with the same keys, then run `npm run build`.
- Extension icons are rendered from [`src/icon.svg`](./src/icon.svg) during build and added to both browser packages.
- Run `npm install`.
- Run `npm run build`.
- Run `npm run build:release` to create the store upload archives in `dist/release/`:
- Chrome: `better-reviews-for-amazon-chrome-<version>.zip`
- Firefox: `better-reviews-for-amazon-firefox-<version>.xpi`

## Contribute

Contributions are welcome on GitHub.

- Open an issue: [github.com/vrizo/better-reviews-for-amazon/issues](https://github.com/vrizo/better-reviews-for-amazon/issues)
- Open a pull request: [github.com/vrizo/better-reviews-for-amazon/pulls](https://github.com/vrizo/better-reviews-for-amazon/pulls)
- A good first contribution is improving translations in [`src/i18n/locales/`](./src/i18n/locales/).
- Store listing notes and copy live in [`docs/store-listing.md`](./docs/store-listing.md).

## Notes

- Requires a signed-in Amazon session.
- Review numbers are cached for 24 hours.
- The script reads Amazon review filter pages and shows the totals on the product page.
- This project is not affiliated with or endorsed by Amazon.
- This project is released under the MIT License.

## Author

Built by [Vitalii Rizo](https://github.com/vrizo).

## Screenshots

Before:

![Before screenshot](./docs/images/review-block-before.png)

After:

![After screenshot](./docs/images/review-block-after.png)

## Docs

Project notes and research live in [`docs/`](./docs/).
