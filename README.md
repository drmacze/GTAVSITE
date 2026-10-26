# GTA V iOS Community

A lightweight, English-language community website built with HTML, CSS, and JavaScript. No build dependencies.

## Pages

- `dist/index.html`: animated Welcome page with a brief introduction, entry button, Discord link, and direct links to other pages.
- `dist/home.html`: Home with the background trailer and two calls to action.
- `dist/news.html`: community news.
- `dist/updates.html`: project updates.
- `dist/community.html`: Discord information, member counts, and staff.
- `dist/faq.html`: searchable frequently asked questions.

The permanent left rail and oversized logo have been removed. Navigation uses a compact header and an animated full-width menu inspired by the reference Rockstar website. The native dialog supports focus containment, Escape, backdrop dismissal, focus return, and reduced-motion preferences.

## Run locally

Run `python3 -m http.server 8080 --directory dist`, then open `http://localhost:8080`. Use an HTTP server rather than `file://` so that content configuration can load.

## Community configuration

Edit `dist/community.json`:

- `name`: community name.
- `discordInvite`: full `https://discord.gg/...` or `https://discord.com/invite/...` URL.
- `trailerUrl`: direct HTTPS video URL or relative file path such as `assets/trailer.mp4`.
- `trailerPoster`: optional direct image URL or local relative image path.
- `staff`: profiles with `name`, `role`, optional `avatar`, and optional numeric `discordUserId`.
- `posts`: announcements with `title`, `summary`, `type` (`news` or `update`), ISO `date`, and optional `url`.

News and Updates display their respective post categories. Missing content has honest empty states; no member counts, profiles, or announcements are invented.

## Discord integration

Once an invite is provided, Discord links become join links. The Community page reads the public invite endpoint for approximate member and online counts, server name, description, and icon. Join links remain available when requests fail. Staff profiles currently come from configuration. Automatic staff role synchronization and channel announcement imports require a future server-side integration. Never put bot tokens or other secrets in `dist/`.

## Artwork and video

Home uses the supplied `dist/assets/los-santos-background.jpeg`. The supplied `dist/assets/gtav-logo.jpeg` appears only as a small header mark. Its original black background remains; background extraction was rejected by the image service.

A configured trailer replaces the Home background. Use a direct media file rather than a YouTube or GitHub blob page. Video loops muted, offers pause and sound controls, respects reduced-motion preferences, and falls back to the artwork on errors. The supplied 84-second trailer is configured at `assets/trailer.mp4`, optimized to H.264/AAC with fast-start metadata for web playback.

The website is independent and is not affiliated with Rockstar Games or Take-Two Interactive. No app or game files are hosted here.

## Welcome page

The site root opens the Welcome page. Internal Home links point to `home.html`, so navigating inside the site does not repeat the introduction. The Welcome page uses lightweight CSS entrance animations and a short exit transition. Skip introduction and direct section links are available. Reduced-motion preferences disable animation. With JavaScript disabled, the entry links still navigate normally. The Home trailer remains on `home.html`.

## Welcome questions and feedback

Enter website opens a compact, accessible dialog. It asks for the discovery source (YouTube, TikTok, Browser, Friends, Other), then Android or iOS. Android users see the iOS-only notice and may continue browsing. iOS users choose an iPhone model from iPhone X through iPhone 18; this is a preference selection, not compatibility verification.

On Home, Android users get a small unsupported-device toast. iOS users get a welcome toast and a Subscribe prompt. Subscribe records local browser interest and displays thanks. It does not register an email address, subscribe a YouTube account, send push notifications, or connect to a mailing service. A real subscription destination or backend must be added separately.

Answers are stored only in browser local storage. A one-time session payload drives the Home notifications; reload does not repeat them. If session storage is unavailable, a temporary device-only URL parameter drives the feedback and is removed immediately. No visitor answers are transmitted to a server. Closing the dialog leaves the visitor on Welcome. Skip introduction remains available.

## Compatibility guide

`compatibility.html` offers source-backed model profiles with a brief visual review animation. It is a lookup, not hardware detection or benchmarking. `compatibility-data.json` holds 36 profiles, reviewed on 26 October 2026, with per-profile Apple hardware links and RAM teardown or original Xcode-analysis sources. Unverified fields are null and remain visibly unverified, including the RAM in the iPhone 18 Pro profiles and the unspecified iPhone 18 entry. No speculative values or FPS estimates are generated.

The checker uses a site-level planning profile of 6 GB installed RAM, iOS 16+, and approximately 30 GB free storage. These are not verified release minimums. RAM below 6 GB is Critical; exactly 6 GB is Minimum; above 6 GB indicates memory headroom only. This correctly distinguishes iPhone 12 (4 GB) from 12 Pro (6 GB), and iPhone 13/13 mini (4 GB) from 13 Pro (6 GB). Installed RAM is not app-available RAM.

CPU, GPU, and Neural Engine cards are informational; no unsupported performance ranking is inferred from core count. Optional iOS/storage values are manually entered and evaluated separately. Missing values are not passed. `compatibility-rules.js` contains the pure assessment rules. Onboarding model preference may preselect an exact matching model; users can change it. The page is linked from the header, expanded menu, footer, and Welcome.

## Local installation guide and iRAM+

`guide.html` contains original community-focused installation guidance, file preparation, memory advice, updates, and troubleshooting. Downloads and build-specific details point to this community’s Discord. No other port’s distribution channel, app-specific folder names, features, or release requirements are represented as this project’s. The public site contains no links to another port website.

Critical installed-RAM profiles expose a contextual iRAM+ card with a direct link to the user-requested tool and a local memory guide link. This card appears for memory-critical profiles only, not for an unrelated low-storage check. iRAM+ is optional, supports eligible Apple Account-signed apps, excludes public enterprise certificates, does not add physical RAM, and does not guarantee compatibility. The checker never upgrades a RAM warning because iRAM+ was suggested. Official tool documentation links are provided in the local guide.
