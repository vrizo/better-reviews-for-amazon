# Screenshot Workflow

Use this workflow when you need to refresh screenshots fast.

## Goal

Create two screenshots:

- before
- after

Both screenshots should highlight the review area with:

- 25px padding
- semi-transparent outside overlay
- `backdrop-filter: blur(2px)`

## Files

Save screenshots here:

- `docs/images/review-block-before.png`
- `docs/images/review-block-after.png`

## Before screenshot

1. Open the Amazon product page in Chrome MCP.
2. Reload the page first, so the userscript is not running.
3. Resize the page to a stable size.
4. Scroll to the product rating block.
5. Add the screenshot overlay around `#averageCustomerReviews_feature_div`.
6. Use 25px padding.
7. Extend the focus area a bit below the rating block, so the future extension area is visible.
8. Save the screenshot as `review-block-before.png`.

## After screenshot

1. Inject the current userscript through DevTools.
2. Wait until the review block appears.
3. Remove the old overlay.
4. Add the same overlay again, but target `#better-reviews-for-amazon-extra`.
5. Use the same 25px padding and blur.
6. Save the screenshot as `review-block-after.png`.

## Injection shortcut

The fastest local command to prepare the userscript for DevTools is:

```bash
sed '1,9d' better-reviews-for-amazon.user.js | base64
```

This removes the userscript metadata header and gives you a base64 string.

Then in DevTools, run:

```js
const source = atob('PASTE_BASE64_HERE');
eval(source);
```

## Overlay idea

The overlay should:

- keep the focus box clear
- blur and dim everything outside the focus box
- add a soft border and shadow around the focus box

Suggested visual settings:

- outside background: `rgba(255,255,255,0.28)`
- blur: `2px`
- border radius: `14px`
- border: `2px solid rgba(15,17,17,0.18)`
- shadow: `0 18px 45px rgba(15,17,17,0.12)`

## Notes

- Keep the same viewport size if possible, so screenshots stay visually consistent.
- Always take the before screenshot after reload.
- Always take the after screenshot only after the review block has finished rendering.
