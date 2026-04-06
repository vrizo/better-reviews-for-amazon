# Architecture Proposal

This is the simplest way to support three open source versions from one code base:

- one userscript
- one Chrome extension
- one Firefox extension

## Recommendation

Use one shared core and three thin platform wrappers.

Suggested structure:

```text
src/
  core/
    amazon.ts
    review-fetch.ts
    review-parse.ts
    render.ts
    storage.ts
  userscript/
    entry.ts
  extension/
    content.ts
    background.ts
    manifest.chrome.json
    manifest.firefox.json
docs/
dist/
```

## How it works

- `src/core/` contains all Amazon-specific logic.
- `src/userscript/entry.ts` starts the core inside Tampermonkey or Violentmonkey.
- `src/extension/content.ts` runs the same core as a content script.
- `src/extension/background.ts` should stay very small, or not exist at first if the extension can work as a content-script-only tool.

## Why this is the easiest path

- one parser
- one renderer
- one storage layer
- one place for review logic
- only small browser-specific files

## Permissions strategy

Keep permissions small.

For extensions, prefer:

- access only to Amazon hosts
- no cross-site permissions
- no remote backend
- no history, cookies, downloads, or webRequest unless truly needed

Chrome and Firefox both support Manifest V3 host permissions and match patterns, so a shared content-script model is realistic. This is my inference from the official docs below.

## Build strategy

The simplest build path is:

1. Write the shared code in TypeScript.
2. Build one bundled userscript file.
3. Build one bundled content script for extensions.
4. Generate two manifests from one shared base:
   one for Chrome
   one for Firefox

## What to avoid

- different business logic per browser
- separate parsers per platform
- backend sync for user data
- broad permissions like all sites if Amazon-only matching is enough

## Sources

- Chrome permissions and host permissions: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions
- Chrome `activeTab`: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- MDN `host_permissions`: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions
- MDN match patterns: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
- MDN manifest.json: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json
