# Better Amazon Reviews

Small userscript for Amazon product pages.

It adds a compact review summary under the product rating:

- verified purchase rating and count
- positive verified reviews
- critical verified reviews
- Vine review count, calculated as `all reviews - verified purchase reviews`

## Install

1. Install Tampermonkey or Violentmonkey.
2. Open [`amazon-review-breakdown.user.js`](./amazon-review-breakdown.user.js).
3. Install the script in your userscript manager.

## Notes

- Best used while signed in to Amazon.
- Review numbers are cached for 24 hours.
- The script reads review totals from Amazon review filter pages and shows them on the product page.
