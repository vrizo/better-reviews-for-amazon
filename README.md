# Better Reviews for Amazon

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

## Install

1. Install Tampermonkey or Violentmonkey.
2. Open [`better-reviews-for-amazon.user.js`](./better-reviews-for-amazon.user.js).
3. Install the script in your userscript manager.

## Development

- Shared Amazon logic lives in [`src/core/`](./src/core/).
- Thin entry points live in [`src/userscript/`](./src/userscript/), [`src/chrome-extension/`](./src/chrome-extension/), and [`src/firefox-extension/`](./src/firefox-extension/).
- Chrome and Firefox manifests are generated from one shared base.
- Run `npm install`.
- Run `npm run build`.

## Notes

- Requires a signed-in Amazon session.
- Review numbers are cached for 24 hours.
- The script reads Amazon review filter pages and shows the totals on the product page.
- This project is not affiliated with or endorsed by Amazon.

## Screenshots

Before:

![Before screenshot](./docs/images/review-block-before.png)

After:

![After screenshot](./docs/images/review-block-after.png)

## Docs

Project notes and research live in [`docs/`](./docs/).
