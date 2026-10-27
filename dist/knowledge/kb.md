# GTA V iOS / iPadOS / macOS port: troubleshooting knowledge base

Current release: **26 Oct 2026 (batches 87-91)**. Built on 27 Oct 2026 from the tester logs, crash reports and fixes of all earlier sessions. Same content as `kb.json`.

50 entries: 44 issues and 6 reference entries. 12 issues are still open or need a player-side step.

## Index

| ID | Title | Status |
|---|---|---|
| [REF-01](#ref-01) | Triage order for any report | reference |
| [REF-02](#ref-02) | Which build is the player on? (GTA5 UUID / compat build time per release) | reference |
| [REF-03](#ref-03) | Reading a crash or hang report | reference |
| [DATA-01](#data-01) | "Can't find its game data" / No titles found / launcher says Not found | player setup |
| [DATA-02](#data-02) | Crash 2-7 seconds after Play: a game archive is missing (incomplete data copy) | player setup |
| [DATA-03](#data-03) | Paleto Bay freeze / crash, Friends Reunited (trevor3) crash, endless loading after Trevor's missions: GTAV_patch not applied | fixed (needs the GTAV_patch data step) |
| [DATA-04](#data-04) | "The game data doesn't match its decryption patches" / app won't start after copying GTAV_patch | workaround |
| [DATA-05](#data-05) | TVs and screens are black; crash in The Bureau Raid cutscene: movies.zip not set up | fixed (movies still needed for TVs) |
| [SIGN-01](#sign-01) | App stopped opening after about a week | not a bug |
| [SIGN-02](#sign-02) | After updating, the game data or saves are gone | not a bug |
| [SIGN-03](#sign-03) | Out-of-memory closes on 6-8 GB phones: the signer dropped the increased memory limit | workaround (signing side) |
| [DEV-01](#dev-01) | Instant crash at launch on iOS 18 / iOS 26 (old 16 Oct IPA) | fixed |
| [DEV-02](#dev-02) | iOS 16: the game doesn't work (crash ~7 s after Play, or endless loading with nothing drawn) | won't fix |
| [DEV-03](#dev-03) | Which devices run the game? | reference |
| [DEV-04](#dev-04) | 4 GB devices: crashes, closes, or stuck screens at higher settings | workaround |
| [DEV-05](#dev-05) | A12Z iPad Pro: random crashes during play | fixed |
| [CRASH-01](#crash-01) | Crash when scrolling weapon upgrades at Ammu-Nation | fixed |
| [CRASH-02](#crash-02) | Crash at an address like 0xdddddddddddddddd: use-after-free in the original game code | open category |
| [CRASH-03](#crash-03) | Crash when reloading (Nervous Ron sniper, assault rifle, carbine, special carbine) | fixed |
| [CRASH-04](#crash-04) | Taking a photo with the in-game phone camera crashes the game | fixed |
| [CRASH-05](#crash-05) | Crash about 25 s after loading a save: Reflection MSAA (or MSAA) set to 8x | launcher limit in a test build (not released); workaround |
| [CRASH-06](#crash-06) | Full Screen vertical mode: crash when switching pause-menu tabs; HUD in the middle; phone cut off | fixed |
| [CRASH-07](#crash-07) | Mac: rare crash on the loading screen right after start | open |
| [FREEZE-01](#freeze-01) | Stuck at the door of a bought garage (Vinewood, Grove Street, Pillbox Hill) | fixed |
| [FREEZE-02](#freeze-02) | The Merryweather Heist: black screen or frozen camera after the freighter explodes | fixed |
| [FREEZE-03](#freeze-03) | Game freezes on a phone call, a timer/alarm (Dynamic Island), Siri, or when Spotify plays | fixed |
| [FREEZE-04](#freeze-04) | Stick minigames can't be done on touch: By the Book (tooth), Did Somebody Say Yoga?, Reuniting the Family (tattoo) | fixed |
| [FREEZE-05](#freeze-05) | Can't get past the brightness screen at the first start | fixed |
| [GAME-01](#game-01) | Money is $0 after loading a save or after Wasted/Busted; shops refuse cheat money | fixed |
| [GAME-02](#game-02) | Multi Target Assassination: the timer runs out before all targets are done | fixed |
| [GAME-03](#game-03) | Can't cross rivers; the current pushes you to one bank (e.g. Predator, Raton Canyon) | fixed |
| [GAME-04](#game-04) | Taxi rides cost $0 and give a wanted level while wearing a trainer skin | fixed (not yet tried in a real cab ride) |
| [GAME-05](#game-05) | Cheats picked from the touch menu don't work | fixed |
| [GAME-06](#game-06) | Trainer interior teleports: places stay open or look odd afterwards | by design (caveat) |
| [GAME-07](#game-07) | GTA Online, Social Club, ONLINE/FRIENDS/STORE tabs | by design |
| [GAME-08](#game-08) | Exit Game goes back to the launcher instead of quitting | by design |
| [CTRL-01](#ctrl-01) | No lock-on, can't snap to the next target while aiming | settings |
| [CTRL-02](#ctrl-02) | No gas/brake while the in-game phone is up in a car | fixed |
| [CTRL-03](#ctrl-03) | In-game internet / menus: pointer stuck in the top-left corner, taps land in the wrong place | fixed |
| [CTRL-04](#ctrl-04) | Forklift: Lower (LS) doesn't respond, Lift works | open (not reproduced) |
| [GFX-01](#gfx-01) | Mission markers and race checkpoints look like a solid yellow (or blue) wall | fixed |
| [GFX-02](#gfx-02) | Broken textures on an M-series iPad after turning on "Original BC Textures" | fixed |
| [GFX-03](#gfx-03) | No shadows in cutscene close-ups | fixed |
| [GFX-04](#gfx-04) | Dark blue screen with command-line text while the game starts | fixed |
| [GFX-05](#gfx-05) | Wrong colours or blocky patches after the 26 Oct update | watch (no reports yet) |
| [PERF-01](#perf-01) | Stuck at 30 or 60 FPS; 90/120/40 FPS options missing | fixed |
| [PERF-02](#perf-02) | 30 FPS isn't smooth / input lag | fixed |
| [PERF-03](#perf-03) | FPS drops, phone gets hot | workaround |
| [MAC-01](#mac-01) | Mac: "macOS can't check the app" / GTA V was blocked | not a bug |
| [MAC-02](#mac-02) | Mac: game data not found, TVs dark, patch step | player setup |

## Reference

### REF-01

**Triage order for any report**

- **Status:** reference
- **Platforms:** iOS, iPadOS, macOS
- **Devices:** All
- **OS versions:** All

**Players say:**

- Any "it crashes" / "it doesn't work" message

**Cause:** Most reports so far were data-side (incomplete copy, skipped GTAV_patch, missing movies) or an old build, not new code bugs.

**Details:**

1. Ask for the whole Logs folder: iPhone/iPad Files > On My iPhone > GTA V > Logs (run.log, run.prev.log, crash-*.txt); Mac ~/Library/Logs/GTA5. Also the device, the iOS version and what they were doing.
2. Find the build: the first log line / the report's device line has "GTA5 UUID ..., compat built ...". Match it in REF-02. Anyone not on the 26 Oct 2026 (batches 87-91) release should update first.
3. Check the data: the launcher's DATA tab should show the full set (113 archives, about 21.6 GB). Any "Unable to find critical archive" line = incomplete copy (DATA-02).
4. Check the fix patch: a run.log line "datapatch: no patches and no .macport_decrypted marker" means GTAV_patch was never applied (DATA-03).
5. Check movies: "no movies/<name>.mp4" lines mean movies.zip is missing (DATA-05).
6. Then match the crash text against the log signatures in this knowledge base.

**Reply to paste:**

> Please send the whole Logs folder (Files > On My iPhone > GTA V > Logs), your device and iOS version, and what you were doing when it happened.

### REF-02

**Which build is the player on? (GTA5 UUID / compat build time per release)**

- **Status:** reference
- **Platforms:** iOS, iPadOS, macOS
- **Devices:** All
- **OS versions:** All

**Players say:**

- Player isn't sure which version they installed
- Report shows an unknown GTA5 UUID

**Log signatures:**

- `GTA5 UUID`
- `compat built`

**Cause:** Every crash report and log starts with a device line naming the GTA5 binary's UUID and the compat library's build time (since the 20 Oct release).

**Details:**

1. 18 Oct release (batch 63): GTA5 C2CC8111 (no compat build time in logs yet)
2. 20 Oct release (batch 66): GTA5 8041FAB9, compat built Oct 20 2026 06:12:09
3. 21 Oct release (batch 70): GTA5 313C1F8D, compat built Oct 21 2026 06:56:55
4. 22 Oct release, morning (batches 71-73): GTA5 193E06C4, compat built Oct 22 2026 08:39:18
5. 22 Oct release, second update (batch 74 + Game Mode): GTA5 1514D0A6, compat built Oct 22 2026 10:39:52
6. 23 Oct release (batch 75 + frame pacing): GTA5 BBE4596C, compat built Oct 22 2026 21:09:13
7. 24 Oct release (batches 76-80): GTA5 4CB1849E, compat built Oct 24 2026 00:02:28 (the 24 Oct A12 test IPA has the same GTA5 with a different graphics layer)
8. 24 Oct evening test build (batches 81-82, all devices incl. A12): GTA5 CF8E87FB, compat built Oct 24 2026 19:51:15
9. 25 Oct release (batches 81-86, first Mac app): GTA5 81F8A070, compat built Oct 25 2026 21:13:51; Mac app GTA5 35EAB785
10. 26 Oct release (batches 87-91), CURRENT: GTA5 32BC6458, compat built Oct 26 2026 17:28:09; Mac app GTA5 7234D513
11. Builds before 18 Oct (16-17 Oct shared IPAs) are too old: tell the player to update.

**Reply to paste:**

> Your log says you're on the [build] build. Please install the latest GTAV-unsigned.ipa over it (same signing app); your data and saves stay.

### REF-03

**Reading a crash or hang report**

- **Status:** reference
- **Platforms:** iOS, iPadOS, macOS
- **Devices:** All
- **OS versions:** All
- **Fixed in:** Rich reports since batch 66 (20 Oct release) (released)

**Players say:**

- Player sends crash-*.txt or run.log and asks what it means

**Log signatures:**

- `*** GTA V (iOS) crashed: SIGSEGV`
- `*** GTA V (macOS) crashed:`
- `fault: read from 0x...: a null pointer + 0x...`
- `freed memory (0xDD fill)`
- `fatal error:`
- `SIGTRAP (__debugbreak)`
- `*** Game hung for 10 s`
- `[RAGE] Hang Detect Thread`
- `*** terminated by signal 15`
- `[macport] previous run: ... no report`
- `--- the game, at most a second before ---`
- `streamer: <file> stalled`

**Cause:** Reports name the signal, the fault decoded (null pointer + offset, freed memory = use-after-free), rage's fatal message, memory/thermal state, the device line, the game state of the last second (player, position, vehicle, cutscene, running scripts = which mission) and the log's tail.

**Details:**

1. "fatal error:" lines and "Unable to find critical archive" are the most telling: start there.
2. SIGTRAP (__debugbreak) right after "Unable to find critical archive" = missing data file (DATA-02).
3. "Game hung for 10 s" = hang report; after 60 s the hang detector deliberately crashes the game (a write to 0 from "[RAGE] Hang Detect Thread"). Look for a "streamer: ... stalled" line first (DATA-03).
4. "terminated by signal 15" = the app was closed (by the player or the system), not a crash.
5. run.prev.log starting with "[macport] previous run: ... no report" = iOS ended the app without a crash (memory limit, swiped away, or killed in the background). Check the last memory line ("MB left").
6. A fault at 0xdddddddddddddddd + small offset = a use-after-free in the original game code (CRASH-02).
7. The running-scripts list tells the mission (e.g. trevor3 = Friends Reunited, docks_heista = The Merryweather Heist, fbi3 = By the Book, gunclub_shop = Ammu-Nation).

## Game data and setup

### DATA-01

**"Can't find its game data" / No titles found / launcher says Not found**

- **Status:** player setup
- **Platforms:** iOS, iPadOS
- **Devices:** All iPhones and iPads
- **OS versions:** All

**Players say:**

- The app says it has no game data
- "Scan Complete! No titles were found"
- Launcher DATA tab: GAME DATA "Not found"
- I copied the files but the game doesn't see them
- I can't find "GTA V" under On My iPhone

**Log signatures:**

- `Grand Theft Auto V can't find its game data.`
- `Scan Complete! No titles were found`
- `Unable to find critical archive 'common.rpf'`

**Cause:** The game data folder has the wrong name (GTAV_IOS, gtav, GTAV (1)), sits in the wrong place (iCloud Drive, Downloads, loose in On My iPhone), or is nested (GTAV > GTAV_IOS > common.rpf). The app only looks for On My iPhone > GTA V > GTAV with common.rpf directly inside.

**Fix / what to do:**

1. Open the app once so iOS creates its "GTA V" folder in Files (Browse > On My iPhone).
2. Unzip the game files completely; inside the result, find the folder that has common.rpf directly in it.
3. Rename that folder to exactly GTAV (capitals, no spaces, no _IOS).
4. Move it into On My iPhone > GTA V (on iPad: On My iPad > GTA V).
5. Test: open On My iPhone > GTA V > GTAV. You must see common.rpf right there.
6. Restart the app; the DATA tab should say "Ready" (or "Decrypts on first start" with GTAV_patch).

**Reply to paste:**

> The folder has to be On My iPhone > GTA V > GTAV, named exactly GTAV, with common.rpf directly inside. Rename GTAV_IOS to GTAV and move it there, then restart the app.

**Related:** DATA-02

### DATA-02

**Crash 2-7 seconds after Play: a game archive is missing (incomplete data copy)**

- **Status:** player setup (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Seen on iPhone 11 Pro (iOS 18.2), iPad 10th gen (A14, 4 GB, iOS 27.2), iPhone 15 Pro Max, a 16 Oct sideload; any device can hit it
- **OS versions:** Any

**Players say:**

- Crashes right after pressing Play, every time
- Crashes on the first loading screen
- The launcher says Ready but the game closes after a few seconds
- My DATA tab shows fewer archives / fewer GB than other people's

**Log signatures:**

- `Unable to find critical archive 'x64a.rpf', check that RFS connected properly.`
- `Unable to find critical archive 'x64/audio/sfx/RADIO_18_90S_ROCK.rpf'`
- `Unable to find critical archive`
- `SIGTRAP (__debugbreak) in CFileMgr::SetupDevices`
- `__debugbreak in CFileMgr::MountAudioPacks`
- `CFileMgr::SetupDevices+1104`

**Cause:** The copy or unzip stopped part way (no space, phone locked, cable unplugged), or files were deleted to save space. The game stops at the first missing archive, so more may be missing. The launcher's scan only checks that common.rpf exists and counts archives, so it can still say Ready.

**Fix / what to do:**

1. Copy the whole GTAV folder again (keep the phone plugged in, Auto-Lock off, enough free space).
2. A full set has 113 archives, about 21.6 GB; x64a.rpf to x64w.rpf are 23 files and GTAV/x64/audio/sfx holds about 54 .rpf files.
3. Folder and file names must match exactly (lowercase as shipped): there is no case-insensitive fallback.
4. If the data is new on this device, apply GTAV_patch once afterwards (DATA-03) and set up movies (DATA-05).

**Notes:** Open improvement: a launcher check against the full list (113 archives and sizes) with a plain "x64k.rpf is missing" message was proposed, not built.

**Reply to paste:**

> Your game data is incomplete: the log says [file] is missing. Delete the GTAV folder and copy it again completely (113 archives, about 21.6 GB), with the phone plugged in and Auto-Lock off.

**Related:** DATA-01, DATA-03

### DATA-03

**Paleto Bay freeze / crash, Friends Reunited (trevor3) crash, endless loading after Trevor's missions: GTAV_patch not applied**

- **Status:** fixed (needs the GTAV_patch data step) (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Any. Reported on iPhone 13 Pro, iPhone 16 (iOS 26.7.1), iPhone 14 Pro Max (iOS 27.0), iPad Pro M4 (iOS 27.2 beta), and others; still being reported on 27 Oct
- **OS versions:** Any
- **Fixed in:** Data: GTAV_patch (phone-format fix, 18 Oct; in the 22 Oct download). Code: batch 60 stall guard (18 Oct release) turns the freeze into a named report. (released)

**Players say:**

- The game freezes near Paleto Bay (by the barber shop, driving through town)
- Crash while driving around Paleto Bay
- Crash when Trevor gets near his trailer in Sandy Shores / when Friends Reunited starts
- "Trevor missions broke everything": endless loading screens on death and in menus, missions don't start
- Endless loading after respawning at Paleto Bay hospital
- Crash at the towing jobs (Tonya)

**Log signatures:**

- `streamer: re_rescuehostage.ysc stalled (deflate)`
- `streamer: trevor3.ysc stalled (deflate)`
- `stalled (deflate): ... rest of its output zeroed`
- `Script '(null)' has globals signature 0`
- `SIGSEGV in strcasecmp from scrProgram::scrProgram on ResourcePlacementThread`
- `datapatch: no patches and no .macport_decrypted marker`
- `datapatch: no patches`
- `CWarpManager: Awaiting LoadScene.IsLoaded()`
- `strStreamingLoaderManager::Flush - waiting`
- `ProcessDecompression`

**Cause:** Five scripts in update/update2.rpf were left encrypted by the data conversion tool (Rescue Hostage random event re_rescuehostage, the story mission Friends Reunited trevor3, towing, and two Online scripts). Before the 18 Oct build the game froze for good when one loaded; since 18 Oct the stall guard writes a report and zeroes the file, and the game then crashes about a second later on the empty script. It's game data, so a new IPA alone doesn't fix it.

**Fix / what to do:**

1. Get the GTAV_patch folder from the 22 Oct download.
2. Copy it into On My iPhone > GTA V, NEXT TO the GTAV folder (not inside it). Don't rename it.
3. Start the game once: it shows "Preparing the game data", applies the fix and deletes the folder.
4. If the app then says the data doesn't match its patches, see DATA-04.
5. Existing saves are fine; once the data is fixed, Friends Reunited and Paleto Bay load normally.

**Notes:** Still the most common report (at least five players so far). Proposed, not built: ship the fix inside the IPA and apply it automatically by script name, so any data copy is fixed without a patch folder.

**Reply to paste:**

> That's the Paleto Bay / Friends Reunited script issue: your game data is missing the fix patch. Copy the GTAV_patch folder from the 22 Oct download into On My iPhone > GTA V, next to the GTAV folder (not inside), and start the game once. It applies itself. If it says update2.rpf is missing or a different size, tell us and we'll send you a fixed file.

**Related:** DATA-04, REF-03

### DATA-04

**"The game data doesn't match its decryption patches" / app won't start after copying GTAV_patch**

- **Status:** workaround (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Any
- **OS versions:** Any
- **Fixed in:** 18 Oct evening: release package switched to the phone-format fix (released)

**Players say:**

- After copying GTAV_patch the app refuses to start
- Error screen about the game data not matching its patches
- The patch step fails every start

**Log signatures:**

- `datapatch: .../GTAV/update/update2.rpf: missing or a different size than the patch expects`
- `datapatch: 1 archives, 1 failed`
- `not a patch`
- `bytes at 0x... don't match the patch source`
- `The game data doesn't match its decryption patches`

**Cause:** The fix patch changes bytes at fixed positions and only fits one exact update2.rpf: the 16 Oct phone data (277,832,704 bytes, 277.8 MB in Files). Causes seen: the player's data is another conversion (different size); the very first 18 Oct package briefly shipped the fix for the PC-format file (325,668,864 bytes); the folder got nested (GTAV_patch/GTAV_patch/...) or put inside GTAV; extra "._" files from a USB stick or a Finder zip ("not a patch"). While a GTAV_patch folder fails, the app refuses to start so it can't damage the archive.

**Fix / what to do:**

1. To play again right away: delete the GTAV_patch folder (the game starts as before, without the Paleto/trevor3 fix).
2. Check the size: Files > On My iPhone > GTA V > GTAV > update > long-press update2.rpf > Get Info.
3. 277.8 MB: use the GTAV_patch from the 22 Oct download (the phone-format fix); the layout must be exactly GTA V/GTAV_patch/update/update2.rpf.rpfpatch.
4. Any other size: the data is a different copy. Replace GTAV/update/update2.rpf with an already-patched 277,832,704-byte update2.rpf from the maintainer (tap Replace). This fixed a player on 21 Oct.
5. Leaving GTAV_patch in place next to an already-fixed update2.rpf is harmless: it finds the fix in place and removes itself.

**Notes:** Proposed, not built: show the file size on the error screen, skip a patch that doesn't fit, ignore ._ files.

**Reply to paste:**

> Your update2.rpf isn't the version the patch was made for. Delete the GTAV_patch folder to play again, then tell us the size of GTAV/update/update2.rpf (Files > long-press > Get Info). If it isn't 277.8 MB we'll send you an already-fixed update2.rpf to replace yours.

**Related:** DATA-03

### DATA-05

**TVs and screens are black; crash in The Bureau Raid cutscene: movies.zip not set up**

- **Status:** fixed (movies still needed for TVs)
- **Platforms:** iOS, iPadOS
- **Devices:** Seen on iPhone 15 (iOS 27.0.1) on the 24 Oct evening test build; any device without the movies
- **OS versions:** Any
- **Fixed in:** Video playback: 18 Oct release (batch 62 + movies.zip). Crash on a missing video: batch 83, 25 Oct release. (released)

**Players say:**

- TVs are black / no TV channels
- LifeInvader presentation screen in Lester's mission is black
- Crash during The Bureau Raid (fire-crew cutscene)
- Crash when a cutscene or mission plays a video

**Log signatures:**

- `[movie] platform:/movies/script_rt_fire: no movies/script_rt_fire.mp4`
- `no movies/`
- `Unable to open movie`
- `SIGSEGV at 0x830 on the AsyncBink thread`
- `bwMovie::AsyncBink`
- `AH_3A_MCS_3`

**Cause:** The game's videos come as converted .mp4 files in GTAV/movies (movies.zip, 51 files, 84 MB). Without them TVs stay black. Builds before batch 83 also crashed when a script started a missing video (The Bureau Raid's script_rt_fire); before 18 Oct every TV was black because video wasn't implemented.

**Fix / what to do:**

1. Unzip movies.zip (from the 22 Oct download) in Files.
2. Move the movies folder into On My iPhone > GTA V > GTAV, so the files are in GTAV/movies/*.mp4 (51 files).
3. Update to the 25 Oct release or newer: a missing video no longer crashes the game.

**Reply to paste:**

> Your game is missing the movies. Unzip movies.zip from the 22 Oct download and move the movies folder into GTA V > GTAV, so the .mp4 files are in GTAV/movies. The 25 Oct build and newer no longer crash on a missing video.

**Related:** DATA-02

## Installing and signing

### SIGN-01

**App stopped opening after about a week**

- **Status:** not a bug
- **Platforms:** iOS, iPadOS
- **Devices:** Any device signed with a free Apple ID
- **OS versions:** Any

**Players say:**

- The game won't open anymore
- It worked yesterday, now it closes immediately
- App icon greyed out / "no longer available"

**Cause:** Apps signed with a free Apple ID stop opening after 7 days when the provisioning profile expires.

**Fix / what to do:**

1. Refresh or re-sign the app with the same signing app you used (AltStore, SideStore, Sideloadly, LiveContainer, ...), installed over the top.
2. Don't delete the app first: the game files and saves live inside it (SIGN-02).

**Reply to paste:**

> Free Apple ID signatures expire after 7 days. Refresh or re-sign the app with the same signing app, installing over the top. Don't delete it first, or the game files and saves go with it.

**Related:** SIGN-02

### SIGN-02

**After updating, the game data or saves are gone**

- **Status:** not a bug
- **Platforms:** iOS, iPadOS
- **Devices:** Any
- **OS versions:** Any

**Players say:**

- After installing the update it asks for the game data again
- My saves disappeared
- There are two GTA V apps now

**Log signatures:**

- `Grand Theft Auto V can't find its game data.`

**Cause:** The game files (about 22 GB) and saves live inside the app's own container. Deleting the app deletes them; installing the update as a second copy (different bundle ID or another signing app) gives an empty new app.

**Fix / what to do:**

1. Install every update OVER the old app with the same signing app and the same bundle ID.
2. If it was already deleted, copy the GTAV folder again (DATA-01), then GTAV_patch and movies once.
3. Back up saves from Files > On My iPhone > GTA V > Rockstar Games > GTA V; the launcher's DATA > IMPORT SAVE (22 Oct release and newer) brings a save file back into a slot.

**Reply to paste:**

> The game files and saves live inside the app. Always install updates over the old app with the same signing app; deleting it or installing a second copy starts empty.

**Related:** SIGN-01, DATA-01

### SIGN-03

**Out-of-memory closes on 6-8 GB phones: the signer dropped the increased memory limit**

- **Status:** workaround (signing side) (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Seen on an iPhone 17 Pro and an 8 GB iPhone 16 (about 3.4 GB available); a 6 GB iPhone 13 Pro report without logs
- **OS versions:** Any
- **Fixed in:** Budgets by the app's limit: batch 69, 21 Oct release (released)

**Players say:**

- The game closes without a crash report after driving a long way or switching characters
- RAM drops below 1 GB in the FPS panel, then it closes
- Crashes on an iPhone 17 Pro / 8 GB phone with high texture settings
- The launcher says iOS lets the game use only about 3.3 GB on an 8 GB phone

**Log signatures:**

- `[macport] memory: iOS lets the game use N MB`
- `[macport] previous run: ... no report`
- `MB left`

**Cause:** iOS ends the app at its memory limit, which depends on the signature, not the RAM. The IPA asks for the increased-memory-limit entitlement, but free-account signers keep it only when the App ID has that capability (what GetMoreRam turns on). Without it an 8 GB phone gives the game ~3.3 GB. Before the 21 Oct release the 12 GB preset's 1600 MB texture cache didn't fit such limits.

**Fix / what to do:**

1. Update to the 21 Oct release or newer: presets and the game's budgets follow the app's real memory limit.
2. Use a signing method that keeps the increased-memory-limit entitlement (e.g. enable the capability with GetMoreRam for a free account). Nothing inside the app can raise the limit.
3. Pick a lower preset or a smaller Texture Cache / Streaming Memory in the launcher.
4. If it still closes, send run.prev.log: its first lines tell how the previous run ended and its last memory line.

**Notes:** A 13 Pro player's RAM write-up (garbage collector, swap, etc.) was reviewed on 21 Oct: mostly not applicable to iOS; logs were asked for and never analysed.

**Reply to paste:**

> Your signing method gives the game less memory than your phone has. Update to the latest build (its presets follow the real limit) and, if you can, sign with the increased memory limit kept (GetMoreRam for free accounts). Lower Texture Cache if it still closes.

**Related:** DEV-04

## Devices and iOS versions

### DEV-01

**Instant crash at launch on iOS 18 / iOS 26 (old 16 Oct IPA)**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPhone 16 Pro Max (iOS 18.3 and iOS 26.2.1); also seen inside LiveContainer
- **OS versions:** Any iOS below 27
- **Fixed in:** 16 Oct evening rebuild; every IPA since 17 Oct (released)

**Players say:**

- Crashes instantly when I open it / press Play
- Closes before anything shows

**Log signatures:**

- `SIGABRT in dxmt::InternalCommandLibrary`
- `InternalCommandLibrary+212`
- `Failed to create internal command library`

**Cause:** The graphics layer's built-in Metal library in the 16 Oct IPAs was built for iOS 27 only, so older iOS refused it at device creation.

**Fix / what to do:**

1. Install any IPA from 17 Oct or later (the current release).

**Reply to paste:**

> You have an IPA from 16 Oct that only works on iOS 27. Install the current GTAV-unsigned.ipa over it.

### DEV-02

**iOS 16: the game doesn't work (crash ~7 s after Play, or endless loading with nothing drawn)**

- **Status:** won't fix
- **Platforms:** iOS, iPadOS
- **Devices:** iPhone 13 on iOS 16.6.1 (the only iOS 16 report)
- **OS versions:** iOS 16.x

**Players say:**

- Crashes a few seconds after Play on iOS 16
- Stuck loading for minutes, phone gets hot
- Nothing renders

**Log signatures:**

- `Failed to create MTLLibrary: ... This library format is not supported on this platform`
- `Compiler encountered an internal error`
- `SIGSEGV in DXMT pipeline-cache worker threads (compat thread ids 352/356)`
- `pipelines built: 0`

**Cause:** iOS 16's GPU shader compiler refuses every pipeline the graphics layer (DXMT) builds. The same shaders compile on newer iOS. The iOS 16 effort was dropped as not worth it.

**Fix / what to do:**

1. Update iOS: every device that can run the game (A13 and newer) can run iOS 17 or later; iOS 18+ is confirmed working.

**Notes:** The IPA still says minimum iOS 16.3, so it installs on iOS 16 but can't run. No iOS 17 report yet.

**Reply to paste:**

> iOS 16 isn't supported: its graphics compiler rejects the game's shaders. Update to iOS 18 or newer.

**Related:** DEV-03

### DEV-03

**Which devices run the game?**

- **Status:** reference
- **Platforms:** iOS, iPadOS
- **Devices:** See fix list
- **OS versions:** iOS 18+ confirmed; iOS 16 doesn't work; iOS 17 untested

**Players say:**

- Will it run on my iPhone/iPad?
- Is iPhone 11 / XR / iPad X supported?

**Cause:** The graphics path needs Apple GPU family features; RAM decides the settings.

**Details:**

1. Confirmed working (6 GB+): iPhone 12 Pro Max, 13 Pro, 14, 14 Pro, 14 Pro Max, 15, 15 Pro Max, 16, 16 Pro Max, 17 Pro Max; iPad Pro M4, A16 iPad.
2. A13 (iPhone 11 series): an iPhone 11 was verified running it (21 Oct).
3. 4 GB devices (iPhone 12/12 mini, iPhone 13/13 mini, iPad 10th gen, iPhone 11): run at the lowest preset (Battery Saver); iOS gives a 4 GB iPad about 2.9 GB. See DEV-04.
4. A12 / A12X / A12Z (iPhone XS, XS Max, XR, iPad Pro 2018/2020): experimental path since the 24 Oct evening test build, in every release since 25 Oct. An A12Z iPad Pro ran it with no visual glitches; no XS/XR has reported. The XR's 3 GB is probably too little.
5. Not supported: A11 and older; iOS 16.
6. Mac: Apple silicon (M1 or later), macOS 14 Sonoma or later (Mac app since 25 Oct).

**Related:** DEV-02, DEV-04, DEV-05

### DEV-04

**4 GB devices: crashes, closes, or stuck screens at higher settings**

- **Status:** workaround
- **Platforms:** iOS, iPadOS
- **Devices:** 4 GB iPhones and iPads
- **OS versions:** Any
- **Fixed in:** Low-memory profile since the first shared builds; budgets by limit batch 69 (21 Oct) (released)

**Players say:**

- Keeps closing on my iPhone 12 / iPhone 13 / iPad 10th gen
- Out of memory on a 4 GB device
- Black screen in a mission on a 4 GB phone

**Log signatures:**

- `[macport] memory: iOS lets the game use 2867 MB`
- `[macport] low-memory profile (N MB of RAM)`
- `[macport] rayfire`
- `[macport] load scene ... not loaded after N s`

**Cause:** iOS lets a 4 GB device's game use roughly 2.3-2.9 GB. The low-memory budgets keep the game around 1.9 GB, but tight streaming budgets also starved some scripted scenes (garages, the Merryweather freighter), fixed in later builds.

**Fix / what to do:**

1. Start with the lowest preset (Battery Saver) and keep Texture Quality Normal.
2. Keep MSAA and Reflection MSAA Off (CRASH-05).
3. Update to the latest build: the garage and Merryweather stalls on small budgets are fixed (FREEZE-01, FREEZE-02).

**Reply to paste:**

> On 4 GB devices start with the Battery Saver preset, Normal textures and MSAA/Reflection MSAA Off, and make sure you're on the latest build.

**Related:** SIGN-03, FREEZE-01, FREEZE-02, CRASH-05

### DEV-05

**A12Z iPad Pro: random crashes during play**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPad Pro 11" 2nd gen (A12Z) on the A12 test build
- **OS versions:** iOS 18.5
- **Fixed in:** Batch 82 (24 Oct evening test build, 25 Oct release) (released)

**Players say:**

- Random crashes every so often on an iPad Pro 2020
- Crash while driving or flying

**Log signatures:**

- `brk #1 at phSimulator::ProcessPairListTask+652`
- `gtaSched`
- `ProcessPairListTask`

**Cause:** A physics race: on Apple CPUs a lock's release doesn't order a later read the way the consoles' did, so a collision task could read a pair list before its count was settled and trip a bounds check.

**Fix / what to do:**

1. Update to the 25 Oct release or newer.

**Notes:** One 10 s hang flying the Lazer on that iPad (render thread waiting, DXMT in IOGPUResourceCreate for an occlusion-query buffer) was not acted on: single sample, still open.

**Reply to paste:**

> That physics crash is fixed in the 25 Oct build and newer. Please update.

## Crashes

### CRASH-01

**Crash when scrolling weapon upgrades at Ammu-Nation**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** Any (seen on an iPhone 13 Pro and a player's device)
- **OS versions:** Any
- **Fixed in:** Batch 58 (17 Oct shared IPA, 18 Oct release) (released)

**Players say:**

- Game crashes in Ammu-Nation when I look through gun upgrades / attachments

**Log signatures:**

- `0xddddddddddddde35`
- `CPedEquippedWeapon::CreateWeaponComponent`
- `GIVE_WEAPON_COMPONENT_TO_WEAPON_OBJECT`
- `gunclub_shop`

**Cause:** Removing a weapon finish in the shop preview left a stale pointer (original game bug the PC survives); the port's heap fills freed memory with 0xDD, so it crashes every time.

**Fix / what to do:**

1. Update: fixed since the 17 Oct afternoon IPA (all releases since 18 Oct).

**Reply to paste:**

> Fixed since 17 Oct. Install the current build.

**Related:** CRASH-02

### CRASH-02

**Crash at an address like 0xdddddddddddddddd: use-after-free in the original game code**

- **Status:** open category (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Any
- **OS versions:** Any
- **Fixed in:** Per case (Ammu-Nation: batch 58)

**Players say:**

- A crash in a part of the game nobody reported before

**Log signatures:**

- `0xdddddddddddddddd`
- `0xdddd`
- `freed memory (0xDD fill) = use-after-free`

**Cause:** The port's heap fills freed memory with 0xDD, so latent use-after-free bugs in Rockstar's code (which the PC game survives by luck) crash here every time. Each one needs its own code fix.

**Fix / what to do:**

1. Send the Logs folder and say exactly what you were doing (shop, mission, menu). Load an earlier save and avoid that action until a fix ships.

**Reply to paste:**

> That's a bug in the original game code that only shows on the port. Please send the whole Logs folder and what you were doing so it can be fixed.

**Related:** CRASH-01

### CRASH-03

**Crash when reloading (Nervous Ron sniper, assault rifle, carbine, special carbine)**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPad Pro M4 (iOS 27.0), iPhone 13 Pro; any device with a weapon finish
- **OS versions:** Any
- **Fixed in:** Batch 72 (22 Oct release, guard) + batch 75 (23 Oct release) (released)

**Players say:**

- Crash when I reload
- Crash in Nervous Ron at the sniper spot
- Assault rifle / carbine rifle / special carbine crash the game on reload
- Crash after hours of play on an iPad Pro M4

**Log signatures:**

- `CTaskReloadGun::CreateHeldClipObject`
- `CEntity::SetModelId`
- `model index 0xffff`
- `fault at 0x51`
- `trevor2`
- `[macport] reload: no model 0x........ (name) for the prop in the hand`
- `[macport] no model for a new object|ped ... skipped instead of crashing`

**Cause:** Ammu-Nation finishes (e.g. the Luxe and Lowrider finishes) swap in their own magazine model, which lives in Online DLC packs the phone data leaves out. The reload created a prop with no model.

**Fix / what to do:**

1. Update to the 23 Oct release or newer (crash guarded since 22 Oct; finish parts handled since 23 Oct).
2. On an older build: remove the finish from the weapon at Ammu-Nation.

**Reply to paste:**

> That reload crash came from weapon finishes whose parts aren't in the phone data. It's fixed since the 22-23 Oct builds; update, or remove the finish on an older build.

### CRASH-04

**Taking a photo with the in-game phone camera crashes the game**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All (iPhone, iPad, Mac)
- **OS versions:** Any
- **Fixed in:** Batch 64 (20 Oct release) (released)

**Players say:**

- Game closes when I take a picture with the phone
- Photos come out squeezed with black bars

**Log signatures:**

- `CHighQualityScreenshot::StoreScreenShotInBuffer`
- `SaveRGBA8SurfaceToJPEG`
- `empty_output_buffer`
- `fwAssetStore<grcTexture>::~fwAssetStore`
- `Output file write error --- out of disk space?`

**Cause:** A memory-stream address parsed wrong on Apple platforms, so the photo's JPEG couldn't be written and the image library quit the game. iPhone photos were also pillarboxed 4:3 at 19.5:9.

**Fix / what to do:**

1. Update to the 20 Oct release or newer.

**Reply to paste:**

> Fixed in the 20 Oct build and newer (photos also have the right shape now). Please update.

### CRASH-05

**Crash about 25 s after loading a save: Reflection MSAA (or MSAA) set to 8x**

- **Status:** launcher limit in a test build (not released); workaround (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** iPhone 12 (A14, 4 GB) on the 24 Oct build; any Apple GPU (Mac too)
- **OS versions:** iOS 26.1 reported; any
- **Fixed in:** Launcher only (compat launcher.mm, 27 Oct test IPA GTAV-unsigned.msaa-launcher-20261027.ipa); the game and its pause menu are unchanged by the maintainer's choice (not released)

**Players say:**

- Crashes every time right after the save loads
- Crash after changing graphics settings
- Crashes when loading into the world, memory is fine

**Log signatures:**

- `sample count 8 is not supported`
- `ReflectionMSAA: 8`
- `CreateTexture2D ... E_INVALIDARG (80070057)`
- `80070057`
- `CViewportManager::CreateFinalScreenRenderPhaseList`
- `grcRenderTargetDX11::CreateFromTextureObject`
- `read from 0x0`

**Cause:** Apple GPUs support at most 4x MSAA. The launcher and the in-game menu offered 8x up to the 26 Oct release; the game builds the water reflection targets with 8 samples, the graphics layer refuses, and the game uses the missing texture.

**Fix / what to do:**

1. Launcher > Graphics: set Reflection MSAA to Off (best on 4 GB devices), 2x or 4x.
2. Keep MSAA below 8x too (launcher Display page). Never pick 8x in the pause menu's Graphics page: it still offers it.
3. From the 27 Oct launcher update on, the launcher only offers Off / 2x / 4x, and a saved 8x shows as 4x and is written as 4x when you press Play.
4. Mac app (no launcher): keep both below 8x in the pause menu.
5. Main-frame MSAA isn't recommended at all: two of its shaders don't build on Apple GPUs (see notes). Use FXAA or Temporal AA instead.

**Notes:** 27 Oct Mac checks: the 26 Oct build with Reflection MSAA 8x crashed 12.6 s in exactly like the tester ("sample count 8 is not supported", then CreateFromTextureObject reading 0x0); Reflection MSAA 4x ran 2 min in the world (47 FPS). Main MSAA 2x with the 26 Oct Mac graphics layer ran 2 min without a crash, but two MSAA pixel shaders fail to build on the M1 ("Undefined symbols: llvm.agx2.sample.itrproj.1xf") and their draws are skipped; with the older 15 Oct Mac graphics layer MSAA 4x crashed in drawPrimitives on the dxmt-encode thread. A game-side cap was built and dropped (maintainer: launcher only).

**Reply to paste:**

> Your Reflection MSAA is set to 8x, which Apple GPUs can't do. In the launcher go to Graphics and set Reflection MSAA to Off, 2x or 4x (and keep MSAA below 8x; Off is best). Don't pick 8x in the pause menu.

**Related:** DEV-04

### CRASH-06

**Full Screen vertical mode: crash when switching pause-menu tabs; HUD in the middle; phone cut off**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPhones in Full Screen vertical mode
- **OS versions:** Any
- **Fixed in:** Batch 80 (24 Oct release) (released)

**Players say:**

- Crash when I open the pause menu and move between tabs in vertical mode
- Top-right HUD sits in the middle of the screen upright
- The phone is cut off in Full Screen vertical mode

**Log signatures:**

- `GetMenuGraphicsSettings`
- `atArray`
- `SIGTRAP`

**Cause:** On an upright screen the resolution list came out empty, and the menu's graphics page indexed it. The HUD and phone were placed for a landscape band.

**Fix / what to do:**

1. Update to the 24 Oct release or newer.
2. On an older build: Vertical Mode Off or Dual Screen.

**Notes:** Known gaps in Full Screen vertical mode: loading and warning screens are cropped at the sides.

**Reply to paste:**

> Fixed in the 24 Oct build and newer. Update, or turn Vertical Mode off on an older build.

### CRASH-07

**Mac: rare crash on the loading screen right after start**

- **Status:** open (still open)
- **Platforms:** macOS
- **Devices:** Mac (M1), seen on the developer's Mac only
- **OS versions:** macOS 27

**Players say:**

- The Mac app crashed during the first loading screen; the next start worked

**Log signatures:**

- `CTimeCycle::SetupRenderThreadFrameInfo`
- `AddDrawList_BeginRender`
- `write to 0x3f8000004040c80e`

**Cause:** Unknown. Seen in about 1 of 3 starts on one day (21 Oct) and once more on 26 Oct; never from players.

**Fix / what to do:**

1. Start the game again.
2. If it happens to you, send ~/Library/Logs/GTA5 (crash-*.txt and run.log).

**Reply to paste:**

> That's a known rare start-up crash on the Mac; start the game again. Please send ~/Library/Logs/GTA5 so we get more samples.

## Freezes and soft locks

### FREEZE-01

**Stuck at the door of a bought garage (Vinewood, Grove Street, Pillbox Hill)**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** 6 GB and 4 GB devices (phone streaming budgets)
- **OS versions:** Any
- **Fixed in:** Batch 68 (21 Oct release) (released)

**Players say:**

- Soft lock when entering my garage
- Stuck while the garage door opens
- Happens with every character

**Log signatures:**

- `vehicle_gen_controller`
- `[macport] load scene ... not loaded after N s`
- `[macport] stream volume waits on`

**Cause:** The garage entry waits, with no time-out, for the interior to finish streaming in; with phone budgets the 136 interior models never loaded while the camera still showed the street.

**Fix / what to do:**

1. Update to the 21 Oct release or newer: after 10 s with only models missing the scene goes on.

**Notes:** Leaving the garage wasn't tested but has the same 10 s fallback.

**Reply to paste:**

> Fixed in the 21 Oct build and newer. Please update.

**Related:** FREEZE-02

### FREEZE-02

**The Merryweather Heist: black screen or frozen camera after the freighter explodes**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** 4 GB devices (iPhone 13 4 GB reported)
- **OS versions:** Any
- **Fixed in:** Batch 87 (26 Oct release) (released)

**Players say:**

- Infinite loading / black screen after Franklin detonates the bombs and the ship starts exploding
- The mission stops there and the story can't continue
- Frozen camera on the sinking ship

**Log signatures:**

- `docks_heista`
- `des_shipsink`
- `[macport] rayfire`

**Cause:** The mission waits, with no time-out, for the ship's destruction end state; on 4 GB budgets 122 of its 229 models were never requested, so it never finished.

**Fix / what to do:**

1. Update to the 26 Oct release or newer; load the save before the mission and replay it.

**Notes:** Confirmed on the developer's iPhone 13 Pro and on a player's 4 GB phone.

**Reply to paste:**

> Fixed in the 26 Oct build: the mission continues after the explosion. Update and replay it.

**Related:** FREEZE-01, DEV-04

## Audio

### FREEZE-03

**Game freezes on a phone call, a timer/alarm (Dynamic Island), Siri, or when Spotify plays**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All iPhones and iPads
- **OS versions:** Any
- **Fixed in:** Batch 86 (25 Oct release) (released)

**Players say:**

- Game freezes when a timer goes off
- Freezes when I get a call
- I can't play Spotify with the game
- Game stuck after Siri

**Log signatures:**

- `[macport] audio session: interrupted`
- `[macport] audio session: interruption ended`
- `[macport] audio: output stopped (nothing taken for N ms): mixing on the clock`
- `[macport] audio: output started again`
- `audNorthAudioEngine::FinishUpdate`

**Cause:** The game's update waited on the audio engine, which waited on iOS's audio callback. An interruption stopped the audio output and nothing restarted it, so the whole game stopped.

**Fix / what to do:**

1. Update to the 25 Oct release or newer: the game keeps running and the sound restarts by itself.
2. Launcher > Audio > Music From Other Apps: Mix (default, Spotify plays along) or Stop It.

**Reply to paste:**

> Fixed in the 25 Oct build and newer; other apps' music can now play along (launcher > Audio).

## Gameplay

### GAME-01

**Money is $0 after loading a save or after Wasted/Busted; shops refuse cheat money**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any
- **Fixed in:** Batch 67 (21 Oct release) (released)

**Players say:**

- Money doesn't save
- $0 after I die or get busted
- Cheat says +$100,000 but the shop says I can't afford it

**Log signatures:**

- `[macport] cash:`
- `main takes SP1's stat N into its balance`

**Cause:** Story scripts only read the saved money back when an online profile is signed in; the port never has one, so every load zeroed the balance and money added by game code never reached it.

**Fix / what to do:**

1. Update to the 21 Oct release or newer. Existing saves get their money back on load (it was saved; only the balance was lost).

**Reply to paste:**

> Fixed since the 21 Oct build; loading your save restores the money that was saved.

### GAME-02

**Multi Target Assassination: the timer runs out before all targets are done**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All touch devices
- **OS versions:** Any
- **Fixed in:** Batch 70 (21 Oct release) (released)

**Players say:**

- Not enough time in the Multi Target Assassination
- The time runs out too quickly

**Log signatures:**

- `assassin_multi`
- `[macport] assassin_multi: time limit 9 -> 18 minutes (2 of 2 places)`

**Cause:** Not a port bug: the original limit is 9 minutes of game time and the clock runs normally. Driving across the city on touch is just slower.

**Fix / what to do:**

1. Update to the 21 Oct release or newer: on iOS the mission gives 18 minutes.

**Reply to paste:**

> The 21 Oct build and newer give that mission 18 minutes on iOS instead of 9.

### GAME-03

**Can't cross rivers; the current pushes you to one bank (e.g. Predator, Raton Canyon)**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPhones, iPads (and the Mac on phone data)
- **OS versions:** Any
- **Fixed in:** Batch 74 (22 Oct second update) (released)

**Players say:**

- Franklin can't swim across the river
- The river throws me to the other side and I can't come back
- River current far too strong

**Cause:** The river flow maps were read in the wrong texture format on the converted data, giving a current about 8x too strong, always towards the south.

**Fix / what to do:**

1. Update to the 22 Oct second update or newer.

**Reply to paste:**

> Fixed since the 22 Oct second update. Please update.

### GAME-04

**Taxi rides cost $0 and give a wanted level while wearing a trainer skin**

- **Status:** fixed (not yet tried in a real cab ride)
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any
- **Fixed in:** Batch 81 (25 Oct release) (released)

**Players say:**

- Taxis are free and I get a star
- Taxi meter shows 00000

**Log signatures:**

- `taxiservice`

**Cause:** With a trainer skin the player isn't a story character, so the taxi script charged nobody and treated it as fare-dodging.

**Fix / what to do:**

1. Update to the 25 Oct release or newer (the taxi charges the story character you were).
2. A meter showing 00000 on Skip Trip is normal: the fare only counts while riding.

**Reply to paste:**

> Fixed in the 25 Oct build and newer: taxis charge the story character you were before the skin.

### GAME-05

**Cheats picked from the touch menu don't work**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All touch devices
- **OS versions:** Any
- **Fixed in:** Batch 78 (24 Oct release) (released)

**Players say:**

- Cheats don't do anything
- I picked a cheat in the pause menu but nothing happened

**Log signatures:**

- `cheat_controller`

**Cause:** Cheats chosen from the menu (opened from the pause menu) were handed over while the game was paused and dropped after 2 s.

**Fix / what to do:**

1. Update to the 24 Oct release or newer: picks wait until you're back in control.

**Reply to paste:**

> Fixed in the 24 Oct build and newer: cheats apply once you unpause.

### GAME-06

**Trainer interior teleports: places stay open or look odd afterwards**

- **Status:** by design (caveat) (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any
- **Fixed in:** Trainer interiors: batch 85 (25 Oct release) (released)

**Players say:**

- After teleporting into an interior a building looks wrong / doubled
- A closed place stays open
- Loaded a save made inside an interior and something is off

**Cause:** 28 of the 150 interiors are places story mode keeps closed; teleporting there unlocks them (and for 12 loads an optional map file, sometimes a building's mission version) until a story script resets it or the app is quit. Saves don't store this.

**Fix / what to do:**

1. Quit and relaunch the app to reset everything.
2. Don't save while standing inside a teleported-to interior.
3. Teleporting during a mission can fail the mission, like any teleport; using none of this changes nothing.

**Notes:** Closing a place again on leaving was offered, not built. Playing a story mission after a teleport is untested.

**Reply to paste:**

> Interior teleports can leave some places open until you quit the app. Relaunch to reset, and don't save inside one.

### GAME-07

**GTA Online, Social Club, ONLINE/FRIENDS/STORE tabs**

- **Status:** by design
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any

**Players say:**

- How do I play online?
- Social Club doesn't work
- Where did the ONLINE tab go?

**Cause:** The port is story mode only: there is no signed-in Social Club profile, and Online can't work.

**Details:**

1. Story mode only. The ONLINE, FRIENDS and STORE pause-menu tabs were removed in the 23 Oct release.

**Reply to paste:**

> The port is story mode only; GTA Online and Social Club don't work on it.

### GAME-08

**Exit Game goes back to the launcher instead of quitting**

- **Status:** by design
- **Platforms:** iOS, iPadOS
- **Devices:** iPhone, iPad
- **OS versions:** Any
- **Fixed in:** Batch 73 (22 Oct release) (released)

**Players say:**

- Exit Game doesn't close the app
- How do I restart the game?

**Cause:** Since the 22 Oct release Exit Game returns to the launcher (CONTINUE / "Quit the game"). iOS doesn't let an app relaunch itself, so a fresh start needs a quit and a manual reopen.

**Details:**

1. CONTINUE returns to the game; "Quit the game" closes it; then open the app again for a fresh start. Settings changed there apply at the next start.

## Controls

### FREEZE-04

**Stick minigames can't be done on touch: By the Book (tooth), Did Somebody Say Yoga?, Reuniting the Family (tattoo)**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All touch devices
- **OS versions:** Any
- **Fixed in:** Right-stick mode + yoga Auto pose: 21 Oct release (compat + batch 69); By the Book: batch 88, 26 Oct release (released)

**Players say:**

- Can't pull the tooth in By the Book: it says rotate the right stick
- The yoga poses are impossible on touch
- Stuck at the tattoo in Reuniting the Family
- Mission soft-locks because there's no right stick

**Log signatures:**

- `fbi3`
- `hlp_PLIER2`
- `Rotate ~PAD_RSTICK_ROTATE~ to pull it out.`
- `yoga`
- `family5`
- `family6`

**Cause:** The camera area's right stick follows finger speed and drops to zero when the finger stops; these minigames need a held stick position. By the Book's pad text uses a token the prompt scan skipped until 26 Oct.

**Fix / what to do:**

1. Update to the 26 Oct release or newer.
2. By the Book: hold RT to grip, then the right stick appears under your left thumb; or tap Auto rotate.
3. Yoga: sticks hold their position; use the Auto pose toggle and the LT+RT button to breathe (21 Oct+).
4. Tattoo: the right side becomes a real right stick while the prompt shows (21 Oct+).
5. A controller also works.

**Notes:** By the Book confirmed on an iPhone 13 Pro; the yoga Auto pose and tattoo were only tested in the touch harness.

**Reply to paste:**

> Update to the 26 Oct build: By the Book puts the right stick under your left thumb (or tap Auto rotate) and the yoga has an Auto pose button.

### FREEZE-05

**Can't get past the brightness screen at the first start**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All touch devices (first start, no controller)
- **OS versions:** Any
- **Fixed in:** Batch 71 (22 Oct release) (released)

**Players say:**

- Stuck on the brightness/calibration screen
- No buttons on the first screen

**Log signatures:**

- `CDisplayCalibration`

**Cause:** The first-start calibration runs its own loop before any HUD update, so touch buttons never appeared.

**Fix / what to do:**

1. Update to the 22 Oct release or newer (Darker / Brighter / Accept buttons).
2. On an older build: connect a controller to accept.

**Reply to paste:**

> Fixed in the 22 Oct build and newer (Darker, Brighter, Accept). Update, or use a controller on an old build.

### CTRL-01

**No lock-on, can't snap to the next target while aiming**

- **Status:** settings (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** All (touch and controller)
- **OS versions:** Any

**Players say:**

- No aim assist on touch
- On a console holding LT and moving the stick snaps to the next target; here it doesn't
- Aiming doesn't lock on

**Log signatures:**

- `TARGETING_MODE`

**Cause:** The PC build's default Targeting Mode is Free Aim (consoles default to Assisted Aim). Free Aim has no lock-on, so there's nothing to switch between.

**Fix / what to do:**

1. Pause menu > Settings > Controls > Targeting Mode: Assisted Aim - Full (or Partial).
2. With lock-on, a quick sideways flick in the look area (about 450 pt/s) switches targets.

**Notes:** An iOS default of Assisted Aim for new profiles was offered, not built.

**Reply to paste:**

> The PC default is Free Aim, which has no lock-on. Go to Settings > Controls > Targeting Mode and pick Assisted Aim; then a quick sideways flick switches targets.

### CTRL-02

**No gas/brake while the in-game phone is up in a car**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All touch devices
- **OS versions:** Any
- **Fixed in:** Batch 68 (21 Oct release) + batch 75 (23 Oct release) (released)

**Players say:**

- Can't accelerate or brake with the phone out
- Phone up while driving switches to a joystick

**Cause:** With the phone up the touch layout was the phone's (d-pad, select, back) without driving controls.

**Fix / what to do:**

1. Update: Gas/Brake show above the phone since the 21 Oct release; the steering arrows stay since 23 Oct.

**Reply to paste:**

> Fixed since the 21 Oct build (Gas/Brake above the phone). Please update.

### CTRL-03

**In-game internet / menus: pointer stuck in the top-left corner, taps land in the wrong place**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPhones (wide screens)
- **OS versions:** Any
- **Fixed in:** Compat fix + batch 73 (22 Oct release) (released)

**Players say:**

- Browser pointer stuck top-left
- Taps in the internet don't hit what I tap
- Menu taps drift right and down at 1280x720 / 1152x648

**Cause:** In the world the game locks and hides the cursor, so touch points were ignored; and the cursor was scaled by the 16:9 frame instead of the wider window.

**Fix / what to do:**

1. Update to the 22 Oct release or newer (tap to click, drag to scroll, Back/Close/Up/Down).

**Reply to paste:**

> Fixed in the 22 Oct build and newer. Please update.

### CTRL-04

**Forklift: Lower (LS) doesn't respond, Lift works**

- **Status:** open (not reproduced) (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Touch devices
- **OS versions:** Any

**Players say:**

- Can't lower the forklift forks on touch

**Cause:** Not reproduced: the touch overlay sends the left stick down as expected.

**Fix / what to do:**

1. Try a controller; send Logs and a screen recording if it keeps happening.

**Reply to paste:**

> We couldn't reproduce that one yet. Please send a short screen recording and the Logs folder.

## Graphics

### GFX-01

**Mission markers and race checkpoints look like a solid yellow (or blue) wall**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** iPhones/iPads at DirectX 10
- **OS versions:** Any
- **Fixed in:** Batch 69 (21 Oct release) (released)

**Players say:**

- Yellow marker is a solid wall
- Checkpoints are solid blue walls

**Cause:** At DirectX 10 the marker mesh was drawn as points, which the A15 rendered as a wall.

**Fix / what to do:**

1. Update to the 21 Oct release or newer (DirectX 11 is also the default since then).
2. On an older build: set DirectX 11 in the launcher.

**Reply to paste:**

> Fixed since the 21 Oct build; on older builds switch to DirectX 11.

### GFX-02

**Broken textures on an M-series iPad after turning on "Original BC Textures"**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** M-series iPads
- **OS versions:** Any
- **Fixed in:** Batch 69 (21 Oct release) (released)

**Players say:**

- Textures garbled / wrong on my M4 iPad
- Everything looks broken after a launcher setting

**Log signatures:**

- `nativeBC`
- `DXMT_FORCE_BC_DECODE`

**Cause:** The converted phone data needs the ETC texture path; the toggle made M-series iPads read them as PC textures.

**Fix / what to do:**

1. Update to the 21 Oct release or newer: the toggle is gone and M-series iPads always use the right path.

**Reply to paste:**

> Update to the latest build; the setting that broke textures was removed on 21 Oct.

### GFX-03

**No shadows in cutscene close-ups**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** Devices at Shadow Quality Normal
- **OS versions:** Any
- **Fixed in:** Batch 79 (24 Oct release) (released)

**Players say:**

- Cutscenes have no shadows on faces
- Cutscene lighting looks flat

**Cause:** At Shadow Quality Normal the sun's shadow map was 16-bit, too coarse for cutscene close-ups.

**Fix / what to do:**

1. Update to the 24 Oct release or newer.
2. Cutscene depth of field has its own toggle in the launcher (HUD & Controls) since 24 Oct.

**Reply to paste:**

> Fixed in the 24 Oct build and newer. Please update.

### GFX-04

**Dark blue screen with command-line text while the game starts**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any
- **Fixed in:** Batch 73 (22 Oct release) (released)

**Players say:**

- Blue screen full of text at start
- "Now loading Grand Theft Auto V..." on blue

**Log signatures:**

- `CSystem::RenderBuildInformation`

**Cause:** A build-information splash from the non-final game build. Harmless.

**Fix / what to do:**

1. Nothing needed; gone since the 22 Oct release (now a black frame).

**Reply to paste:**

> That screen is harmless and gone since the 22 Oct build.

### GFX-05

**Wrong colours or blocky patches after the 26 Oct update**

- **Status:** watch (no reports yet) (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** Any chip other than the A15 (only the A15 was tested)
- **OS versions:** Any

**Players say:**

- Wrong colours since the latest update
- Blocky patches on surfaces

**Log signatures:**

- `[macport] gpu:`

**Cause:** The 26 Oct release turned the GPU's lossless memory compression back on (about +19% FPS on an A15). No artifacts were seen on the A15; other chips are untested.

**Fix / what to do:**

1. Send a screenshot, the device model and the Logs folder.

**Reply to paste:**

> Thanks, please send a screenshot, your device model and the Logs folder: the 26 Oct GPU change was only tested on an iPhone 13 Pro.

## Performance

### PERF-01

**Stuck at 30 or 60 FPS; 90/120/40 FPS options missing**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All; 90/120 need a 120 Hz screen
- **OS versions:** Any
- **Fixed in:** 18 Oct (defaults), batch 69 21 Oct (Off), batch 71 22 Oct (90/120), batch 89 26 Oct (40) (released)

**Players say:**

- Capped at 30 FPS
- Frame Limiter Off is still 60 FPS
- No 120 FPS option
- Where is 40 FPS?

**Log signatures:**

- `[macport] frame limit`
- `[macport] display: up to 120 Hz`

**Cause:** Old defaults Windowed + VSync Half capped the game at 30 FPS (switched once to Fullscreen/VSync Off in the 18 Oct release). Frame Limiter Off ran at 60 on ProMotion screens until 21 Oct. 90/120 FPS steps came on 22 Oct (VSync must be Off), 40 FPS on 26 Oct.

**Fix / what to do:**

1. Update to the latest build.
2. Launcher: Screen Type Fullscreen, VSync Off, then pick the Frame Limiter step.
3. Steps above the screen's refresh rate are hidden (144 never shows on iPhone/iPad).
4. If you go back to a build older than 26 Oct after choosing 40 FPS, the limiter reads Off.

**Reply to paste:**

> Set Fullscreen and VSync Off in the launcher, then choose the Frame Limiter step; 90/120 need a 120 Hz screen and the latest build.

### PERF-02

**30 FPS isn't smooth / input lag**

- **Status:** fixed
- **Platforms:** iOS, iPadOS
- **Devices:** All
- **OS versions:** Any
- **Fixed in:** Frame pacing (DXMT present wait), 23 Oct release (released)

**Players say:**

- 30 FPS shows 33.3 ms but still stutters
- Controls feel laggy at 30 FPS

**Log signatures:**

- `[macport] display:`

**Cause:** Frames were handed to the screen with drifting timing (some held 50 ms). Input lag of ~100 ms at 30 FPS is the game's own frame pipeline.

**Fix / what to do:**

1. Update to the 23 Oct release or newer (presents wait for the screen).
2. For less lag, use a higher limit: 40 FPS on 120 Hz screens, or 60.

**Reply to paste:**

> Frame pacing was fixed in the 23 Oct build. For less input lag, try 40 FPS (120 Hz screens) or 60.

### PERF-03

**FPS drops, phone gets hot**

- **Status:** workaround (still open)
- **Platforms:** iOS, iPadOS
- **Devices:** All iPhones
- **OS versions:** Any
- **Fixed in:** Batch 91 GPU changes (26 Oct release) (released)

**Players say:**

- FPS drops after the update
- Phone gets very hot and FPS falls
- 60 FPS at first, then 40-50

**Log signatures:**

- `thermal serious`
- `thermal critical`
- `[macport] gpu: N ms a frame`

**Cause:** Heat, not the GPU's top speed, is the limit: an iPhone 13 Pro holds 60 FPS at thermal "fair" and drops to 40-50 at serious/critical. FPS-drop reports after the 20 Oct release found no cause in the code (Mac A/B identical).

**Fix / what to do:**

1. Use a 30 or 40 FPS cap (cooler and steadier).
2. Update to the 26 Oct release: GPU compression back on (about a sixth less GPU work per frame) and MetalFX capped at the screen's resolution.
3. Lower Frame Scaling / resolution or use a lower preset.
4. Send the Logs folder: run.log has FPS, slowest frames, memory and thermal state every 10 s.

**Reply to paste:**

> Heat is the main limit on phones. Use a 30 or 40 FPS cap and the 26 Oct build (less GPU work). If it still drops, send the Logs folder.

## Mac

### MAC-01

**Mac: "macOS can't check the app" / GTA V was blocked**

- **Status:** not a bug
- **Platforms:** macOS
- **Devices:** Apple silicon Macs
- **OS versions:** macOS 14+

**Players say:**

- The Mac app won't open the first time
- macOS says the app is damaged or can't be verified

**Cause:** The Mac app isn't notarized, so Gatekeeper blocks the first start.

**Fix / what to do:**

1. Right-click (Control-click) GTA V.app > Open > Open.
2. macOS 15 and later: open it once, then System Settings > Privacy & Security > "GTA V" was blocked > Open Anyway.
3. Or in Terminal: xattr -dr com.apple.quarantine "/path/to/GTA V.app"

**Reply to paste:**

> Right-click GTA V.app > Open > Open (on macOS 15+: System Settings > Privacy & Security > Open Anyway).

### MAC-02

**Mac: game data not found, TVs dark, patch step**

- **Status:** player setup
- **Platforms:** macOS
- **Devices:** Apple silicon Macs
- **OS versions:** macOS 14+

**Players say:**

- Mac app asks for the game folder
- TVs are dark on the Mac

**Cause:** The Mac app uses the same GTAV folder as the iPhone. A PC install's folder works but has no converted movies, so TVs stay dark.

**Fix / what to do:**

1. Put the GTAV folder beside the app or in Documents/GTAV; otherwise pick it at the first start.
2. If the phone data wasn't patched, put GTAV_patch beside GTAV before the first start (applied once).
3. For TVs, the GTAV folder needs the movies folder (DATA-05).
4. Logs: Finder > Go > Go to Folder > ~/Library/Logs/GTA5.

**Related:** DATA-03, DATA-05

## Deliberately left out

- **Developer-only Mac crash reports in ~/Library/Logs/GTA5 (4-23 Oct):** About 100 reports from the developer's own test runs: SIGTERM ends of test runs, crashes during development of features (mods folder, trainer) fixed before any build shipped. Only the open loading-screen crash is kept (CRASH-07).
- **Launcher crash after ~20-30 s in the launcher (16 Oct):** Developer's phone only; fixed in batch 55 before the first shared IPA.
- **Crash ~30 s into the 4 GB test config (15 Oct):** Developer's phone, test config; fixed the same day before sharing.
- **Shadows drawn while the menu says Off (14 Oct):** Fixed in batch 51, before the first shared IPA.
- **Ring/Silent switch muting the game (11 Oct):** Fixed in batch 44, before the first shared IPA.
- **0.5 s freezes on the Mac (11 Oct):** Development-time pacing work, not a player report.
- **Mac boot hang at the Local Network prompt (25 Oct):** Found and fixed while building the first Mac app.
- **Suspended GTA5 process lingering without an app-switcher card (26 Oct):** Seen only on the developer's phone; no drain, no player impact.
- **The 28 damaged Lite data entries (destruction sets, parachute_decals, id2_17_void, mppilot):** Checked 19 Oct: never registered, no mission loads them; no player symptom possible.
- **Feature requests in the same lists (vertical mode, trainer, mods, Self Radio, keyboard/mouse, controller in the launcher, language mods):** Features, not problems; nothing a player needs to troubleshoot.
- **Jagged edges / shimmering (developer's 11 Oct TODO):** A quality request answered with Temporal AA, not a report.
