# XDE developer knowledge integration

Source: the three files provided by XDE on 27 October 2026, with 50 entries. Preserve factual content and release status. This is retrieval from developer notes, not model training or live knowledge of subsequent releases.

Edit entries in `scripts/build_kb.py` and run:

```sh
python scripts/build_kb.py dist/knowledge
node tests/developer-kb.cjs
```

This regenerates `dist/knowledge/kb.json`, `kb.md`, and the readable `dist/developer-notes.html` used by source links. Keep the snapshot date current in the renderer and retriever when new developer notes arrive.

`franklin-developer-kb.js` loads JSON locally and ranks titles, symptoms and exact log signatures. Distinctive signatures receive priority. Weak or competing matches return a triage question for failure reports instead of a diagnosis. Basic Indonesian terms are normalized, but this is not comprehensive multilingual understanding. Explicit platform mismatches are penalized. Short unresolved follow-ups escalate the previous case without claiming it is confirmed.

The developer retriever is loaded before existing helper answer engines. Each engine checks it before general website passages. Developer answers carry `grounded: true`, so the optional local model does not paraphrase away steps or release caveats. Unreleased fixes stay labelled as test builds; released and still-open status remain separate. Original `reply` templates are not blindly posted, avoiding unresolved placeholders such as `[file]` and `[build]`.

No log upload or remote log processing was added. Users may paste relevant excerpts into the existing chat. Matching runs in the browser; persistent chat behavior remains controlled by the pre-existing helper. No personal report history or tester database was added.

Tests cover representative missing archive, MSAA test build, Paleto Bay, camera, money and macOS cases, broad crash ambiguity and off-topic fallback. These are retrieval regression tests, not evidence of clinical diagnostic accuracy or that all 50 cases will match every phrasing. Browser QA confirms an actual chat submission surfaces CRASH-05, unreleased status and the source link.
