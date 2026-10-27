# Developer knowledge integration

XDE's 50-entry source follows the original workflow: edit `scripts/build_kb.py`, run `python scripts/build_kb.py dist/knowledge`, then run `node tests/developer-kb.cjs`. The generator writes JSON for the helper and Markdown for human readers. It does not publish a notes HTML page.

The browser loads `knowledge/kb.json` and ranks log signatures, symptoms and titles. Troubleshooting replies preserve released, unreleased and still-open distinctions. No reply includes a link to the developer notes, JSON or Markdown. These files are ordinary site data, not confidential server-only storage; someone inspecting network requests can retrieve them. This is intentional per the owner's clarified requirement.

Log attachments are read on the device. Their diagnostic excerpts use the same developer retrieval as chat questions. The helper falls back to a basic local log review when no reliable case matches or the knowledge cannot load. No private backend is required. No log upload/storage is performed for this flow. Native Share sends the original file only through the app the user chooses.

The compact paperclip, content/extension/size validation and top-right notification remain. Bot log messages include an avatar and place the bubble in the main grid column to prevent narrow vertical text. Keep both elements if the chat layout is changed.

Run the regression tests and syntax checks. Tests cover signature matching, symptom matching, release caveats, unclear questions, and absence of notes links. Basic log summaries report captured values, not live device state or a confirmed crash cause.


Helper sheet: mobile header swipe down minimizes the conversation to an edge dock; swipe up or tap restores the same session. The composer includes bottom safe-area padding and follows the visual viewport when a keyboard opens. Reply preparation now displays “Franklin is typing” with dots for a bounded, content-length-based interval, then renders the entire answer at once. This is a presentation indicator, not model token streaming.

Disconnect ends the local helper session: conversation, draft, attachment and support OS/build selection are cleared. It hides the mobile dock and restores the compact launcher. In-flight reply renderers check a session generation before appending or focusing the composer. Minimizing still preserves the conversation.

Mobile sheet geometry uses visualViewport height and offsetTop directly, with no separate keyboard subtraction. While open, the background page is locked at its existing scroll position. OS version entry uses a text keyboard and normalizes commas to periods. The collapsed dock has a larger touch target and opens after a 22px upward drag or a tap.

Disconnect is an accessible red circular phone control in the header and collapsed dock. The previous close control minimizes the panel. A pointer-transparent SVG stroke travels around the panel outline using the selected accent; animation pauses when closed and becomes a static outline with reduced motion.

OS family and user-confirmed OS version are saved in localStorage under franklin-device-profile-v1. Disconnect still removes messages, draft, attachments and app build, but restores saved OS details and starts at app selection. The user can edit or forget the saved OS. Logs do not overwrite this saved profile. Conversation routing now accepts greetings (including hei), acknowledgements, confusion and common short English/Indonesian project requests before off-topic rejection. Technical facts remain sourced from the existing developer knowledge.

Expanded dataset: run python scripts/build-helper-dataset.py to rebuild dist/franklin-dataset.json from reviewed existing Q&A and support-workflow entries. This is a retrieval dataset, not model training and not exhaustive knowledge. XDE issue signatures retain priority. The dataset matcher requires strong coverage and a margin between candidates; unsupported questions request clarification. Scope checks reject explicit unrelated topics before technical retrieval and donation routing. No new technical claim is inferred from generated question variants.

Help-request regression: communication loads before the helper UI and is shared with fallback engines. Polite/reordered English and Indonesian help requests are recognized without requiring a GTA keyword. Requests with an external subject such as cooking or maths remain outside scope; technical details continue through diagnostic routing. HTML and helper script cache revalidation keeps returning visitors on the current loader.

Location requests return only the OS-specific Logs path and attachment instruction. They do not render REF-01 internal triage steps or change the last diagnosed case. Build-identification requests also receive a short action rather than the release inventory.
