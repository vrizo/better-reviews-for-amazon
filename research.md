# Publishing Research

This is a practical product and policy note, not legal advice.

## Short answer

You can publish a browser extension or userscript that changes how Amazon product pages look, but there is no clean official blessing from Amazon for this use case.

The lowest-risk version is:

- client-side only
- no account automation
- no background crawling
- no scraping at scale
- no server-side resale of Amazon data
- no Amazon logos or implied endorsement
- a descriptive name like `Better Reviews for Amazon`
- a clear disclaimer such as `This extension was not created or endorsed by Amazon.`

## Can Amazon block users or developers for this?

I did **not** find an official Amazon retail page that says: “If you use or publish a browser extension that modifies Amazon pages, your account will be banned automatically.”

I **did** find Amazon site terms on Amazon-owned properties that give Amazon broad room to act against tools they consider misuse, especially if they go beyond a local UI overlay.

Key points from Amazon-owned terms pages:

- Amazon says its license does **not** include commercial use, derivative use, downloading/copying account information for third parties, or use of data mining / robots / similar extraction tools.
- Amazon also says you may not reproduce, resell, or otherwise exploit parts of an Amazon service for commercial purposes without consent.
- Amazon says you may not use Amazon trademarks, logos, hidden text, or framing techniques without consent.

Practical reading:

- A small userscript that reads two review-filter pages and renders a local summary on the page looks much lower risk than a crawler, affiliate hijacker, or price-scraping service.
- Risk goes up sharply if the extension starts collecting order history, addresses, checkout data, browsing activity across sites, or exporting Amazon page data to your own backend.
- I found press reports that Amazon previously warned customers to remove the Honey browser extension because it could read and change shopping-page data. That is not the same as a policy page, but it is useful evidence that Amazon may react aggressively to extensions it dislikes.

## Can you publish it in the Chrome Web Store?

Probably yes, but the **Chrome Web Store** introduces its own review risks:

- extensions must have a single clear purpose
- browsing-data use must be tightly limited to the user-facing feature
- permissions must be as narrow as possible
- you must not imply that the product is endorsed by another company
- you must not infringe third-party trademarks

This means a store listing is easier if:

- the extension only works on Amazon product/review pages
- the description clearly says what it does
- the privacy policy says data stays local, if that is true
- there is no remote analytics or data resale
- the title and screenshots do not imitate Amazon branding

## Can you use `Amazon` in the plugin name?

The safer answer is: **yes, but only descriptively and carefully**.

Amazon developer trademark guidance says that if you refer to Amazon in an app title, you should:

- use Amazon only to describe compatibility or purpose, with wording like `for` or `to`
- not use Amazon logos, icons, or images
- not imply sponsorship or endorsement
- include the statement `This app was not created or endorsed by Amazon.`

Chrome Web Store policy lines up with that and separately says you must not pretend your product is authorized by, endorsed by, or produced by another company.

### Safer naming examples

- Better Reviews for Amazon
- Vine Review Signals for Amazon
- Verified vs Vine Reviews for Amazon

### Riskier naming examples

- Amazon Vine Reviews Pro
- Official Amazon Vine Helper
- Amazon Review Analyzer

The risky pattern is when `Amazon` becomes the main brand instead of a compatibility reference.

## Can you market it as a plugin for Amazon Vine reviews?

Yes, but keep it **descriptive**, not **official-sounding**.

Safer positioning:

- `Shows verified vs Vine review signals on Amazon product pages`
- `Helps you inspect Amazon review quality signals`
- `Calculates Vine review count from Amazon review filters`

Less safe positioning:

- `Official Amazon Vine review plugin`
- `Amazon-approved Vine review tool`
- anything implying participation in, affiliation with, or endorsement by the Amazon Vine program

Also note:

- `Amazon Vine` is an official Amazon program name
- Amazon officially labels Vine reviews with the badge `Vine Customer Review of Free Product`
- using that phrase in descriptions as a factual reference is easier to defend than using it as your own primary brand

## How to reduce risk instead of “bypassing” restrictions

If you want to publish this with the lowest practical risk:

1. Keep all processing local in the browser.
2. Limit the extension to product pages and review pages only.
3. Do not touch checkout, saved addresses, payment methods, order history, or account settings.
4. Do not collect or transmit shopping data unless it is absolutely required and clearly disclosed.
5. Do not rewrite affiliate links or inject ads.
6. Do not use Amazon logos, favicon-like marks, or UI that looks official.
7. Add a visible disclaimer in the README / store listing:
   `Not affiliated with or endorsed by Amazon.`
8. If you publish in the Chrome Web Store, request the smallest possible permissions.

## Store vs userscript distribution

Operationally, a userscript distributed through GitHub is usually easier than a Chrome Web Store listing because:

- there is no Chrome Web Store review queue
- there is less store-level trademark scrutiny on listing metadata

But this does **not** remove Amazon-related legal or policy risk. It only removes one layer of platform review.

## Bottom line

My practical recommendation:

- keep the public name descriptive, not branded as if it were official
- use `for Amazon`, not `Amazon` as the main brand
- avoid `official`, `approved`, `authorized`, or `Amazon Vine` as the primary product brand
- describe the feature as reading Amazon review filters and surfacing better review signals

If you want the safest public branding, I would ship it as something like:

- `Better Reviews for Amazon`
- subtitle: `Verified vs Vine review signals on Amazon product pages`

## Sources

Official / primary:

- Amazon Developer Trademark Guidelines: https://developer.amazon.com/fr/support/legal/tuabg
- Amazon Alexa Trademark Guidelines: https://developer.amazon.com/en-US/alexa/branding/alexa-guidelines/communication-guidelines/trademark-guidelines
- Chrome Web Store Program Policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store Impersonation & Intellectual Property: https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property/
- Chrome Web Store Malicious and Prohibited Products: https://developer.chrome.com/docs/webstore/program-policies/malicious-and-prohibited
- Amazon Shipping Site Terms: https://shipping.amazon.com/info/site-terms
- Amazon Relay Site Terms: https://relay.amazon.com/terms
- Amazon Vine official overview: https://www.amazon.com/vine/about
- Sell on Amazon, Vine overview: https://sell.amazon.com/tools/vine?lang=en-US

Secondary / precedent:

- CNBC on Amazon warning users about Honey: https://www.cnbc.com/2020/01/10/amazon-says-uninstall-honey-which-paypal-just-paid-4-million-for.html
- TechNadu summary of the Honey warning: https://www.technadu.com/amazon-warns-risks-honey-browser-extension/89689/
