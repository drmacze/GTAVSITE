# Private helper and user logs

Complete XDE entries must never be committed again. The public JSON, Markdown, readable notes page and source generator were removed. The previous commits still contain them. **The GitHub repository must be made private, or its history cleaned by the owner, before claiming the knowledge source is confidential. Previously downloaded copies cannot be recalled.** Existing public deployment copies may likewise remain accessible until retired by their hosting provider.

Developer retrieval is now a POST to `/api/helper`. The browser receives a focused troubleshooting answer only, not the corpus, source inventory, internal notes or private build details. No endpoint lists records. Responses intentionally reveal user-facing advice; this does not prevent someone collecting advice through repeated questions.

## Cloudflare Pages configuration required

`functions/api/helper.js` uses the existing `VISITS_DB` D1 binding for a per-IP 15-request/minute limit. Only a salted address hash and short-lived counter are stored, never the log/question. It needs private secrets `XDE_KB_PARTS` and `XDE_KB_0` through `XDE_KB_N`. Split the original JSON into ordered chunks of at most 4,000 characters and set the count. Use environment secret settings; never frontend variables. Deploy after setting secrets. No copies belong in `dist`, public Git history or source maps.

The values have been stored as Sites runtime secrets, but this static Sites project does not execute Pages Functions. The separate Cloudflare Pages project needs its own secret configuration. Without the backend, analysis fails closed with a clear unavailable message. No fallback downloads the knowledge to the browser.

## Log attachment

Attach a log opens a file picker for non-empty `.log` and `.txt` files up to 512 KB. Selecting the file only reads it on the device. A diagnostic excerpt (up to 90,000 characters) is prepared and previewed. Common email/token patterns are redacted for analysis, but this is not comprehensive anonymization. Users must review personal information. Only pressing Analyze sends the excerpt to the same-origin helper endpoint. The endpoint processes the request in memory and does not store or log it; hosting-level network metadata may still be recorded by the platform.

Share file uses the device's native share sheet with the **original file** and allows the user to choose Discord or another app. It does not silently send to a Discord channel, bot, staff member or webhook. On unsupported browsers, explain that the user can attach the file manually in Discord. No uploaded log is made public or assigned a download URL.

## Verification

Run `node tests/developer-kb.cjs` and syntax-check the browser scripts and server modules. Test configured analysis and unavailable analysis separately. Never use real user logs in automated tests or a public fixture.
