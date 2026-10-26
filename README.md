# GTA V iOS Community Hub

A responsive English-language community website centered on Discord, styled after the supplied GTA V launcher reference. Built with HTML, CSS, and JavaScript. No build dependencies.

## Run locally

Run `python3 -m http.server 8080 --directory dist`, then open `http://localhost:8080`. Serve over HTTP; loading via `file://` will prevent the configuration request.

## Community content

Edit `dist/community.json`:

- `name`: community name.
- `discordInvite`: full `https://discord.gg/...` or `https://discord.com/invite/...` URL. Empty until the server invite is supplied.
- `trailerUrl`: direct HTTPS video URL or a relative path such as `assets/trailer.mp4`. An MP4 encoded with H.264 is suitable for broad browser support. YouTube and GitHub blob page URLs are not direct video files. Upload the trailer into `dist/assets/`, then set its relative path here, or provide a publicly accessible direct media URL.
- `trailerPoster`: optional direct image URL or local relative image path.
- `staff`: public profiles, each with `name`, `role`, optional `avatar`, and optional numeric `discordUserId`.
- `posts`: announcements with `title`, `summary`, `type` (`news` or `update`), ISO `date`, and optional `url` to the full announcement.

Empty news, team, and Discord sections have honest empty states. No member counts, staff profiles, releases, or news have been invented.

## Discord integration

Once an invite is configured, the site connects Join Discord buttons and reads the public invite endpoint for approximate member and online counts, server name, description, and icon. Discord may rate-limit or restrict requests. The join link continues to work when counts are unavailable. No bot token is needed for this public information.

Staff profiles currently come from the configuration file, not a live Discord role lookup. Automatic role-based staff lists and channel announcement synchronization require a future server-side integration. Keep bot tokens and other secrets out of `dist/`; every file there is public to website visitors. The JSON content format provides a boundary for that future integration.

## Video behavior

The current background is the user-supplied Los Santos image at `dist/assets/los-santos-background.jpeg`. The user-supplied logo is at `dist/assets/gtav-logo.jpeg`. The logo retains its original black background because the image service rejected background extraction; replace it with a transparent PNG when supplied and update the HTML/CSS asset paths. No launcher screenshots are displayed. Until a trailer is supplied, the site uses the supplied background image. Configured video plays muted and loops, with pause and sound controls. Reduced-motion preferences disable autoplay. A failed video falls back to the static hero. Original launcher screenshots have been removed.

## Features

- Responsive navigation and community layout.
- News and update category filters.
- Searchable FAQ with native expandable answers.
- Discord community statistics and staff directory.
- Configurable background trailer with accessible playback controls.

This project is independent and is not affiliated with Rockstar Games or Take-Two Interactive. It does not host game files or an IPA.
