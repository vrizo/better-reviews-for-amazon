# Publishing Research

This is a practical product and policy note, not legal advice.

## Short answer

You can publish a browser extension or userscript that changes how Amazon product pages look, but there is no clear official Amazon approval for this use case.

The lower-risk version is:

- client-side only
- no account automation
- no background crawling
- no scraping at scale
- no server-side resale of Amazon data
- no Amazon logos or implied endorsement
- a descriptive name like `Better Reviews for Amazon`
- a clear disclaimer such as `This project was not created or endorsed by Amazon.`

## Can Amazon block users or developers for this?

I did not find an official Amazon retail page that says a small page-modifying extension or userscript always leads to an account ban.

I did find Amazon-owned terms pages that give Amazon broad room to act against tools they see as misuse, especially if the tool goes beyond a local UI overlay.

Key points from Amazon-owned terms pages:

- Amazon says its license does not include commercial use, derivative use, downloading or copying account information for third parties, or use of data mining, robots, or similar extraction tools.
- Amazon also says you may not reproduce, resell, or otherwise exploit parts of an Amazon service for commercial purposes without consent.
- Amazon says you may not use Amazon trademarks, logos, hidden text, or framing techniques without consent.

Practical reading:

- A local userscript that reads a few review-filter pages and renders a summary on the current page looks much lower risk than a crawler, affiliate hijacker, or price-scraping service.
- Risk goes up sharply if the tool starts reading order history, addresses, checkout data, or sends Amazon page data to a backend.
- There are press reports that Amazon warned users to remove the Honey browser extension. That is not the same as an official policy page, but it shows Amazon may react strongly to extensions it dislikes.

## Can you publish it in the Chrome Web Store?

Probably yes, but the Chrome Web Store has its own review risks:

- the extension must have a single clear purpose
- browsing-data use must be tightly limited to the user-facing feature
- permissions should be as small as possible
- the extension must not imply endorsement by another company
- the extension must not infringe third-party trademarks

This makes review easier if:

- the extension only works on Amazon product and review pages
- the description clearly says what it does
- the privacy policy says data stays local, if that is true
- there is no remote analytics or data resale
- the title and screenshots do not imitate Amazon branding

## Can you use `Amazon` in the project name?

Yes, but the safer pattern is descriptive naming, not Amazon-branded naming.

Good pattern:

- `Better Reviews for Amazon`

Riskier pattern:

- `Amazon Better Reviews`
- `Official Amazon Reviews`
- `Amazon Vine Pro`

The safer reading of Amazon trademark guidance is:

- use Amazon only to describe compatibility or purpose
- do not use Amazon logos or icons
- do not imply sponsorship or endorsement
- include a clear disclaimer

## Can you market it as a tool for Amazon Vine reviews?

Yes, but keep it descriptive, not official-sounding.

Safer positioning:

- `Shows verified vs Vine review signals on Amazon product pages`
- `Helps you inspect Amazon review quality signals`
- `Calculates Vine review count from Amazon review filters`

Less safe positioning:

- `Official Amazon Vine review tool`
- `Amazon-approved Vine helper`

Also note:

- `Amazon Vine` is an official Amazon program name
- Amazon officially labels Vine reviews with the badge `Vine Customer Review of Free Product`
- using that phrase as a factual reference is easier to defend than using it as your own main brand

## Risk reduction rules for this project

This project should stay within these limits:

1. Keep all processing local in the browser.
2. Limit the tools to Amazon pages only.
3. Do not touch checkout, payment, addresses, or account settings.
4. Do not collect or transmit user data.
5. Do not rewrite links or inject affiliate codes.
6. Do not use Amazon logos or visuals that look official.
7. Keep a visible disclaimer in the README and store listings.

## Bottom line

The practical recommendation is:

- use `for Amazon`, not Amazon-branded naming
- avoid `official`, `approved`, or `authorized`
- keep the project local-only and privacy-safe
- describe the project as a compatibility tool for Amazon pages

## Sources

Official / primary:

- Amazon Developer Trademark Guidelines: https://developer.amazon.com/fr/support/legal/tuabg
- Amazon Alexa Trademark Guidelines: https://developer.amazon.com/en-US/alexa/branding/alexa-guidelines/communication-guidelines/trademark-guidelines
- Chrome Web Store Program Policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store Impersonation and Intellectual Property: https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property/
- Chrome Web Store Malicious and Prohibited Products: https://developer.chrome.com/docs/webstore/program-policies/malicious-and-prohibited
- Amazon Shipping Site Terms: https://shipping.amazon.com/info/site-terms
- Amazon Relay Site Terms: https://relay.amazon.com/terms
- Amazon Vine official overview: https://www.amazon.com/vine/about
- Sell on Amazon, Vine overview: https://sell.amazon.com/tools/vine?lang=en-US

Secondary:

- CNBC on Amazon warning users about Honey: https://www.cnbc.com/2020/01/10/amazon-says-uninstall-honey-which-paypal-just-paid-4-million-for.html
- TechNadu summary of the Honey warning: https://www.technadu.com/amazon-warns-risks-honey-browser-extension/89689/
