# GTA V iOS Community

A lightweight, English-language community website built with HTML, CSS, and JavaScript. No build dependencies.

## Pages

- `dist/index.html`: minimal Home with background artwork, introduction, and two calls to action.
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
