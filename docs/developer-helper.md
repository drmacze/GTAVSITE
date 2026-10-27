# Developer knowledge integration

XDE's 50-entry source follows the original workflow: edit `scripts/build_kb.py`, run `python scripts/build_kb.py dist/knowledge`, then run `node tests/developer-kb.cjs`. The generator writes JSON for the helper and Markdown for human readers. It does not publish a notes HTML page.

The browser loads `knowledge/kb.json` and ranks log signatures, symptoms and titles. Troubleshooting replies preserve released, unreleased and still-open distinctions. No reply includes a link to the developer notes, JSON or Markdown. These files are ordinary site data, not confidential server-only storage; someone inspecting network requests can retrieve them. This is intentional per the owner's clarified requirement.

Log attachments are read on the device. Their diagnostic excerpts use the same developer retrieval as chat questions. The helper falls back to a basic local log review when no reliable case matches or the knowledge cannot load. No private backend is required. No log upload/storage is performed for this flow. Native Share sends the original file only through the app the user chooses.

The compact paperclip, content/extension/size validation and top-right notification remain. Bot log messages include an avatar and place the bubble in the main grid column to prevent narrow vertical text. Keep both elements if the chat layout is changed.

Run the regression tests and syntax checks. Tests cover signature matching, symptom matching, release caveats, unclear questions, and absence of notes links. Basic log summaries report captured values, not live device state or a confirmed crash cause.
