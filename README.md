# GTAV / iOS

An English-language GTA V Port community website with a dark theme and lime accents. Built with HTML, CSS, and JavaScript, with no build dependencies.

## Run locally

Run `python3 -m http.server 8080 --directory dist`, then open `http://localhost:8080`.

## Features

- Responsive layouts for desktop, tablet, and iPhone.
- Four-tab launcher gallery with keyboard navigation and fullscreen image dialogs.
- Installation preparation checklist and FAQ.
- Local screenshots supplied by the user.
- Links to Five Star Port resources, without hosting IPA or game files.

## Structure

- `dist/index.html`: page structure and English content.
- `dist/styles.css`: responsive styling and accessibility.
- `dist/app.js`: gallery, menu, dialog, and checklist interactions.
- `dist/assets/`: user-provided screenshots.
- `.openai/hosting.json`: Sites deployment configuration.

## Notes

This website does not run GTA V in the browser or detect devices or game files. FPS labels and device information in screenshots are not website benchmark results. This project is not affiliated with Rockstar Games or Take-Two Interactive.

External project guide: https://fivestarport.site/
