"""Build the GTA V port troubleshooting knowledge base (JSON + Markdown) from one list of entries.

usage: build_kb.py OUTDIR
"""
import json
import os
import sys

CURRENT = "26 Oct 2026 (batches 87-91)"

E = []


def entry(**kw):
    kw.setdefault("kind", "issue")
    kw.setdefault("platforms", ["iOS", "iPadOS"])
    kw.setdefault("log_signatures", [])
    kw.setdefault("related", [])
    kw.setdefault("notes", "")
    E.append(kw)


# ---------------------------------------------------------------- reference

entry(
    id="REF-01", kind="reference", category="reference",
    title="Triage order for any report",
    platforms=["iOS", "iPadOS", "macOS"],
    symptoms=["Any \"it crashes\" / \"it doesn't work\" message"],
    devices="All", os_versions="All",
    cause="Most reports so far were data-side (incomplete copy, skipped GTAV_patch, missing movies) or an old build, "
          "not new code bugs.",
    player_fix=[
        "Ask for the whole Logs folder: iPhone/iPad Files > On My iPhone > GTA V > Logs (run.log, run.prev.log, "
        "crash-*.txt); Mac ~/Library/Logs/GTA5. Also the device, the iOS version and what they were doing.",
        "Find the build: the first log line / the report's device line has \"GTA5 UUID ..., compat built ...\". "
        "Match it in REF-02. Anyone not on the " + CURRENT + " release should update first.",
        "Check the data: the launcher's DATA tab should show the full set (113 archives, about 21.6 GB). Any "
        "\"Unable to find critical archive\" line = incomplete copy (DATA-02).",
        "Check the fix patch: a run.log line \"datapatch: no patches and no .macport_decrypted marker\" means "
        "GTAV_patch was never applied (DATA-03).",
        "Check movies: \"no movies/<name>.mp4\" lines mean movies.zip is missing (DATA-05).",
        "Then match the crash text against the log signatures in this knowledge base.",
    ],
    fixed_in=None, released=None, status="reference", still_open=False,
    reply="Please send the whole Logs folder (Files > On My iPhone > GTA V > Logs), your device and iOS version, "
          "and what you were doing when it happened.",
    sources=["HANDOFF: Logs and crash reports with more in them", "memory: crash-logging-batch66"],
)

entry(
    id="REF-02", kind="reference", category="reference",
    title="Which build is the player on? (GTA5 UUID / compat build time per release)",
    platforms=["iOS", "iPadOS", "macOS"],
    symptoms=["Player isn't sure which version they installed", "Report shows an unknown GTA5 UUID"],
    log_signatures=["GTA5 UUID", "compat built"],
    devices="All", os_versions="All",
    cause="Every crash report and log starts with a device line naming the GTA5 binary's UUID and the compat "
          "library's build time (since the 20 Oct release).",
    player_fix=[
        "18 Oct release (batch 63): GTA5 C2CC8111 (no compat build time in logs yet)",
        "20 Oct release (batch 66): GTA5 8041FAB9, compat built Oct 20 2026 06:12:09",
        "21 Oct release (batch 70): GTA5 313C1F8D, compat built Oct 21 2026 06:56:55",
        "22 Oct release, morning (batches 71-73): GTA5 193E06C4, compat built Oct 22 2026 08:39:18",
        "22 Oct release, second update (batch 74 + Game Mode): GTA5 1514D0A6, compat built Oct 22 2026 10:39:52",
        "23 Oct release (batch 75 + frame pacing): GTA5 BBE4596C, compat built Oct 22 2026 21:09:13",
        "24 Oct release (batches 76-80): GTA5 4CB1849E, compat built Oct 24 2026 00:02:28 "
        "(the 24 Oct A12 test IPA has the same GTA5 with a different graphics layer)",
        "24 Oct evening test build (batches 81-82, all devices incl. A12): GTA5 CF8E87FB, compat built Oct 24 2026 19:51:15",
        "25 Oct release (batches 81-86, first Mac app): GTA5 81F8A070, compat built Oct 25 2026 21:13:51; "
        "Mac app GTA5 35EAB785",
        "26 Oct release (batches 87-91), CURRENT: GTA5 32BC6458, compat built Oct 26 2026 17:28:09; "
        "Mac app GTA5 7234D513",
        "Builds before 18 Oct (16-17 Oct shared IPAs) are too old: tell the player to update.",
    ],
    fixed_in=None, released=None, status="reference", still_open=False,
    reply="Your log says you're on the [build] build. Please install the latest GTAV-unsigned.ipa over it "
          "(same signing app); your data and saves stay.",
    sources=["release IPAs in the release_* packages (UUIDs read from the binaries)", "memory: shared-ipa"],
)

entry(
    id="REF-03", kind="reference", category="reference",
    title="Reading a crash or hang report",
    platforms=["iOS", "iPadOS", "macOS"],
    symptoms=["Player sends crash-*.txt or run.log and asks what it means"],
    log_signatures=[
        "*** GTA V (iOS) crashed: SIGSEGV", "*** GTA V (macOS) crashed:", "fault: read from 0x...: a null pointer + 0x...",
        "freed memory (0xDD fill)", "fatal error:", "SIGTRAP (__debugbreak)", "*** Game hung for 10 s",
        "[RAGE] Hang Detect Thread", "*** terminated by signal 15", "[macport] previous run: ... no report",
        "--- the game, at most a second before ---", "streamer: <file> stalled",
    ],
    devices="All", os_versions="All",
    cause="Reports name the signal, the fault decoded (null pointer + offset, freed memory = use-after-free), "
          "rage's fatal message, memory/thermal state, the device line, the game state of the last second "
          "(player, position, vehicle, cutscene, running scripts = which mission) and the log's tail.",
    player_fix=[
        "\"fatal error:\" lines and \"Unable to find critical archive\" are the most telling: start there.",
        "SIGTRAP (__debugbreak) right after \"Unable to find critical archive\" = missing data file (DATA-02).",
        "\"Game hung for 10 s\" = hang report; after 60 s the hang detector deliberately crashes the game "
        "(a write to 0 from \"[RAGE] Hang Detect Thread\"). Look for a \"streamer: ... stalled\" line first (DATA-03).",
        "\"terminated by signal 15\" = the app was closed (by the player or the system), not a crash.",
        "run.prev.log starting with \"[macport] previous run: ... no report\" = iOS ended the app without a crash "
        "(memory limit, swiped away, or killed in the background). Check the last memory line (\"MB left\").",
        "A fault at 0xdddddddddddddddd + small offset = a use-after-free in the original game code (CRASH-02).",
        "The running-scripts list tells the mission (e.g. trevor3 = Friends Reunited, docks_heista = "
        "The Merryweather Heist, fbi3 = By the Book, gunclub_shop = Ammu-Nation).",
    ],
    fixed_in="Rich reports since batch 66 (20 Oct release)", released=True, status="reference", still_open=False,
    reply="",
    sources=["HANDOFF: Logs and crash reports with more in them", "memory: crash-logging-batch66"],
)

# ---------------------------------------------------------------- data / setup

entry(
    id="DATA-01", category="setup",
    title="\"Can't find its game data\" / No titles found / launcher says Not found",
    symptoms=[
        "The app says it has no game data",
        "\"Scan Complete! No titles were found\"",
        "Launcher DATA tab: GAME DATA \"Not found\"",
        "I copied the files but the game doesn't see them",
        "I can't find \"GTA V\" under On My iPhone",
    ],
    log_signatures=["Grand Theft Auto V can't find its game data.", "Scan Complete! No titles were found",
                    "Unable to find critical archive 'common.rpf'"],
    devices="All iPhones and iPads", os_versions="All",
    cause="The game data folder has the wrong name (GTAV_IOS, gtav, GTAV (1)), sits in the wrong place "
          "(iCloud Drive, Downloads, loose in On My iPhone), or is nested (GTAV > GTAV_IOS > common.rpf). "
          "The app only looks for On My iPhone > GTA V > GTAV with common.rpf directly inside.",
    player_fix=[
        "Open the app once so iOS creates its \"GTA V\" folder in Files (Browse > On My iPhone).",
        "Unzip the game files completely; inside the result, find the folder that has common.rpf directly in it.",
        "Rename that folder to exactly GTAV (capitals, no spaces, no _IOS).",
        "Move it into On My iPhone > GTA V (on iPad: On My iPad > GTA V).",
        "Test: open On My iPhone > GTA V > GTAV. You must see common.rpf right there.",
        "Restart the app; the DATA tab should say \"Ready\" (or \"Decrypts on first start\" with GTAV_patch).",
    ],
    fixed_in=None, released=None, status="player setup", still_open=False,
    reply="The folder has to be On My iPhone > GTA V > GTAV, named exactly GTAV, with common.rpf directly inside. "
          "Rename GTAV_IOS to GTAV and move it there, then restart the app.",
    related=["DATA-02"],
    sources=["GTAV_iOS_Install_Guide.txt (17 Oct)", "session: game file install tutorial (17 Oct)"],
)

entry(
    id="DATA-02", category="setup",
    title="Crash 2-7 seconds after Play: a game archive is missing (incomplete data copy)",
    symptoms=[
        "Crashes right after pressing Play, every time",
        "Crashes on the first loading screen",
        "The launcher says Ready but the game closes after a few seconds",
        "My DATA tab shows fewer archives / fewer GB than other people's",
    ],
    log_signatures=[
        "Unable to find critical archive 'x64a.rpf', check that RFS connected properly.",
        "Unable to find critical archive 'x64/audio/sfx/RADIO_18_90S_ROCK.rpf'",
        "Unable to find critical archive",
        "SIGTRAP (__debugbreak) in CFileMgr::SetupDevices",
        "__debugbreak in CFileMgr::MountAudioPacks",
        "CFileMgr::SetupDevices+1104",
    ],
    devices="Seen on iPhone 11 Pro (iOS 18.2), iPad 10th gen (A14, 4 GB, iOS 27.2), iPhone 15 Pro Max, "
            "a 16 Oct sideload; any device can hit it",
    os_versions="Any",
    cause="The copy or unzip stopped part way (no space, phone locked, cable unplugged), or files were deleted to "
          "save space. The game stops at the first missing archive, so more may be missing. The launcher's scan "
          "only checks that common.rpf exists and counts archives, so it can still say Ready.",
    player_fix=[
        "Copy the whole GTAV folder again (keep the phone plugged in, Auto-Lock off, enough free space).",
        "A full set has 113 archives, about 21.6 GB; x64a.rpf to x64w.rpf are 23 files and "
        "GTAV/x64/audio/sfx holds about 54 .rpf files.",
        "Folder and file names must match exactly (lowercase as shipped): there is no case-insensitive fallback.",
        "If the data is new on this device, apply GTAV_patch once afterwards (DATA-03) and set up movies (DATA-05).",
    ],
    fixed_in=None, released=None, status="player setup", still_open=True,
    notes="Open improvement: a launcher check against the full list (113 archives and sizes) with a plain "
          "\"x64k.rpf is missing\" message was proposed, not built.",
    reply="Your game data is incomplete: the log says [file] is missing. Delete the GTAV folder and copy it again "
          "completely (113 archives, about 21.6 GB), with the phone plugged in and Auto-Lock off.",
    related=["DATA-01", "DATA-03"],
    sources=["memory: tester-reports-2026-10-21", "memory: tester-reports-2026-10-22",
             "HANDOFF: A missing movie crashed The Bureau Raid (second report)", "session: 17 Oct two tester crashes"],
)

entry(
    id="DATA-03", category="setup",
    title="Paleto Bay freeze / crash, Friends Reunited (trevor3) crash, endless loading after Trevor's missions: GTAV_patch not applied",
    symptoms=[
        "The game freezes near Paleto Bay (by the barber shop, driving through town)",
        "Crash while driving around Paleto Bay",
        "Crash when Trevor gets near his trailer in Sandy Shores / when Friends Reunited starts",
        "\"Trevor missions broke everything\": endless loading screens on death and in menus, missions don't start",
        "Endless loading after respawning at Paleto Bay hospital",
        "Crash at the towing jobs (Tonya)",
    ],
    log_signatures=[
        "streamer: re_rescuehostage.ysc stalled (deflate)",
        "streamer: trevor3.ysc stalled (deflate)",
        "stalled (deflate): ... rest of its output zeroed",
        "Script '(null)' has globals signature 0",
        "SIGSEGV in strcasecmp from scrProgram::scrProgram on ResourcePlacementThread",
        "datapatch: no patches and no .macport_decrypted marker",
        "datapatch: no patches",
        "CWarpManager: Awaiting LoadScene.IsLoaded()",
        "strStreamingLoaderManager::Flush - waiting",
        "ProcessDecompression",
    ],
    devices="Any. Reported on iPhone 13 Pro, iPhone 16 (iOS 26.7.1), iPhone 14 Pro Max (iOS 27.0), "
            "iPad Pro M4 (iOS 27.2 beta), and others; still being reported on 27 Oct",
    os_versions="Any",
    cause="Five scripts in update/update2.rpf were left encrypted by the data conversion tool (Rescue Hostage "
          "random event re_rescuehostage, the story mission Friends Reunited trevor3, towing, and two Online "
          "scripts). Before the 18 Oct build the game froze for good when one loaded; since 18 Oct the stall "
          "guard writes a report and zeroes the file, and the game then crashes about a second later on the "
          "empty script. It's game data, so a new IPA alone doesn't fix it.",
    player_fix=[
        "Get the GTAV_patch folder from the 22 Oct download.",
        "Copy it into On My iPhone > GTA V, NEXT TO the GTAV folder (not inside it). Don't rename it.",
        "Start the game once: it shows \"Preparing the game data\", applies the fix and deletes the folder.",
        "If the app then says the data doesn't match its patches, see DATA-04.",
        "Existing saves are fine; once the data is fixed, Friends Reunited and Paleto Bay load normally.",
    ],
    fixed_in="Data: GTAV_patch (phone-format fix, 18 Oct; in the 22 Oct download). Code: batch 60 stall guard "
             "(18 Oct release) turns the freeze into a named report.",
    released=True, status="fixed (needs the GTAV_patch data step)", still_open=True,
    notes="Still the most common report (at least five players so far). Proposed, not built: ship the fix inside "
          "the IPA and apply it automatically by script name, so any data copy is fixed without a patch folder.",
    reply="That's the Paleto Bay / Friends Reunited script issue: your game data is missing the fix patch. Copy the "
          "GTAV_patch folder from the 22 Oct download into On My iPhone > GTA V, next to the GTAV folder (not "
          "inside), and start the game once. It applies itself. If it says update2.rpf is missing or a different "
          "size, tell us and we'll send you a fixed file.",
    related=["DATA-04", "REF-03"],
    sources=["memory: paleto-freeze-2026-10-18", "memory: tester-reports-2026-10-21",
             "HANDOFF: Paleto Bay freeze", "sessions of 25 Oct and 27 Oct (two more unpatched players)"],
)

entry(
    id="DATA-04", category="setup",
    title="\"The game data doesn't match its decryption patches\" / app won't start after copying GTAV_patch",
    symptoms=[
        "After copying GTAV_patch the app refuses to start",
        "Error screen about the game data not matching its patches",
        "The patch step fails every start",
    ],
    log_signatures=[
        "datapatch: .../GTAV/update/update2.rpf: missing or a different size than the patch expects",
        "datapatch: 1 archives, 1 failed",
        "not a patch",
        "bytes at 0x... don't match the patch source",
        "The game data doesn't match its decryption patches",
    ],
    devices="Any", os_versions="Any",
    cause="The fix patch changes bytes at fixed positions and only fits one exact update2.rpf: the 16 Oct phone "
          "data (277,832,704 bytes, 277.8 MB in Files). Causes seen: the player's data is another conversion "
          "(different size); the very first 18 Oct package briefly shipped the fix for the PC-format file "
          "(325,668,864 bytes); the folder got nested (GTAV_patch/GTAV_patch/...) or put inside GTAV; extra "
          "\"._\" files from a USB stick or a Finder zip (\"not a patch\"). While a GTAV_patch folder fails, the "
          "app refuses to start so it can't damage the archive.",
    player_fix=[
        "To play again right away: delete the GTAV_patch folder (the game starts as before, without the "
        "Paleto/trevor3 fix).",
        "Check the size: Files > On My iPhone > GTA V > GTAV > update > long-press update2.rpf > Get Info.",
        "277.8 MB: use the GTAV_patch from the 22 Oct download (the phone-format fix); the layout must be exactly "
        "GTA V/GTAV_patch/update/update2.rpf.rpfpatch.",
        "Any other size: the data is a different copy. Replace GTAV/update/update2.rpf with an already-patched "
        "277,832,704-byte update2.rpf from the maintainer (tap Replace). This fixed a player on 21 Oct.",
        "Leaving GTAV_patch in place next to an already-fixed update2.rpf is harmless: it finds the fix in place "
        "and removes itself.",
    ],
    fixed_in="18 Oct evening: release package switched to the phone-format fix", released=True,
    status="workaround", still_open=True,
    notes="Proposed, not built: show the file size on the error screen, skip a patch that doesn't fit, ignore ._ files.",
    reply="Your update2.rpf isn't the version the patch was made for. Delete the GTAV_patch folder to play again, "
          "then tell us the size of GTAV/update/update2.rpf (Files > long-press > Get Info). If it isn't 277.8 MB "
          "we'll send you an already-fixed update2.rpf to replace yours.",
    related=["DATA-03"],
    sources=["memory: paleto-freeze-2026-10-18", "memory: tester-reports-2026-10-21", "session: 18 Oct release"],
)

entry(
    id="DATA-05", category="setup",
    title="TVs and screens are black; crash in The Bureau Raid cutscene: movies.zip not set up",
    symptoms=[
        "TVs are black / no TV channels",
        "LifeInvader presentation screen in Lester's mission is black",
        "Crash during The Bureau Raid (fire-crew cutscene)",
        "Crash when a cutscene or mission plays a video",
    ],
    log_signatures=[
        "[movie] platform:/movies/script_rt_fire: no movies/script_rt_fire.mp4",
        "no movies/", "Unable to open movie",
        "SIGSEGV at 0x830 on the AsyncBink thread", "bwMovie::AsyncBink",
        "AH_3A_MCS_3",
    ],
    devices="Seen on iPhone 15 (iOS 27.0.1) on the 24 Oct evening test build; any device without the movies",
    os_versions="Any",
    cause="The game's videos come as converted .mp4 files in GTAV/movies (movies.zip, 51 files, 84 MB). Without "
          "them TVs stay black. Builds before batch 83 also crashed when a script started a missing video "
          "(The Bureau Raid's script_rt_fire); before 18 Oct every TV was black because video wasn't implemented.",
    player_fix=[
        "Unzip movies.zip (from the 22 Oct download) in Files.",
        "Move the movies folder into On My iPhone > GTA V > GTAV, so the files are in GTAV/movies/*.mp4 "
        "(51 files).",
        "Update to the 25 Oct release or newer: a missing video no longer crashes the game.",
    ],
    fixed_in="Video playback: 18 Oct release (batch 62 + movies.zip). Crash on a missing video: batch 83, 25 Oct release.",
    released=True, status="fixed (movies still needed for TVs)", still_open=False,
    reply="Your game is missing the movies. Unzip movies.zip from the 22 Oct download and move the movies folder "
          "into GTA V > GTAV, so the .mp4 files are in GTAV/movies. The 25 Oct build and newer no longer crash on "
          "a missing video.",
    related=["DATA-02"],
    sources=["memory: missing-movie-batch83", "HANDOFF: A missing movie crashed The Bureau Raid",
             "memory: todo-2026-10-18"],
)

# ---------------------------------------------------------------- signing / installing

entry(
    id="SIGN-01", category="install-signing",
    title="App stopped opening after about a week",
    symptoms=["The game won't open anymore", "It worked yesterday, now it closes immediately",
              "App icon greyed out / \"no longer available\""],
    log_signatures=[],
    devices="Any device signed with a free Apple ID", os_versions="Any",
    cause="Apps signed with a free Apple ID stop opening after 7 days when the provisioning profile expires.",
    player_fix=[
        "Refresh or re-sign the app with the same signing app you used (AltStore, SideStore, Sideloadly, "
        "LiveContainer, ...), installed over the top.",
        "Don't delete the app first: the game files and saves live inside it (SIGN-02).",
    ],
    fixed_in=None, released=None, status="not a bug", still_open=False,
    reply="Free Apple ID signatures expire after 7 days. Refresh or re-sign the app with the same signing app, "
          "installing over the top. Don't delete it first, or the game files and saves go with it.",
    related=["SIGN-02"],
    sources=["GTAV_iOS_Install_Guide.txt", "memory: free-profile-renewal"],
)

entry(
    id="SIGN-02", category="install-signing",
    title="After updating, the game data or saves are gone",
    symptoms=["After installing the update it asks for the game data again", "My saves disappeared",
              "There are two GTA V apps now"],
    log_signatures=["Grand Theft Auto V can't find its game data."],
    devices="Any", os_versions="Any",
    cause="The game files (about 22 GB) and saves live inside the app's own container. Deleting the app deletes "
          "them; installing the update as a second copy (different bundle ID or another signing app) gives an "
          "empty new app.",
    player_fix=[
        "Install every update OVER the old app with the same signing app and the same bundle ID.",
        "If it was already deleted, copy the GTAV folder again (DATA-01), then GTAV_patch and movies once.",
        "Back up saves from Files > On My iPhone > GTA V > Rockstar Games > GTA V; the launcher's DATA > "
        "IMPORT SAVE (22 Oct release and newer) brings a save file back into a slot.",
    ],
    fixed_in=None, released=None, status="not a bug", still_open=False,
    reply="The game files and saves live inside the app. Always install updates over the old app with the same "
          "signing app; deleting it or installing a second copy starts empty.",
    related=["SIGN-01", "DATA-01"],
    sources=["GTAV_iOS_Install_Guide.txt", "memory: todo-2026-10-22 (import save)"],
)

entry(
    id="SIGN-03", category="install-signing",
    title="Out-of-memory closes on 6-8 GB phones: the signer dropped the increased memory limit",
    symptoms=[
        "The game closes without a crash report after driving a long way or switching characters",
        "RAM drops below 1 GB in the FPS panel, then it closes",
        "Crashes on an iPhone 17 Pro / 8 GB phone with high texture settings",
        "The launcher says iOS lets the game use only about 3.3 GB on an 8 GB phone",
    ],
    log_signatures=[
        "[macport] memory: iOS lets the game use N MB",
        "[macport] previous run: ... no report",
        "MB left",
    ],
    devices="Seen on an iPhone 17 Pro and an 8 GB iPhone 16 (about 3.4 GB available); a 6 GB iPhone 13 Pro report "
            "without logs",
    os_versions="Any",
    cause="iOS ends the app at its memory limit, which depends on the signature, not the RAM. The IPA asks for "
          "the increased-memory-limit entitlement, but free-account signers keep it only when the App ID has that "
          "capability (what GetMoreRam turns on). Without it an 8 GB phone gives the game ~3.3 GB. Before the "
          "21 Oct release the 12 GB preset's 1600 MB texture cache didn't fit such limits.",
    player_fix=[
        "Update to the 21 Oct release or newer: presets and the game's budgets follow the app's real memory limit.",
        "Use a signing method that keeps the increased-memory-limit entitlement (e.g. enable the capability with "
        "GetMoreRam for a free account). Nothing inside the app can raise the limit.",
        "Pick a lower preset or a smaller Texture Cache / Streaming Memory in the launcher.",
        "If it still closes, send run.prev.log: its first lines tell how the previous run ended and its last memory line.",
    ],
    fixed_in="Budgets by the app's limit: batch 69, 21 Oct release", released=True,
    status="workaround (signing side)", still_open=True,
    notes="A 13 Pro player's RAM write-up (garbage collector, swap, etc.) was reviewed on 21 Oct: mostly not "
          "applicable to iOS; logs were asked for and never analysed.",
    reply="Your signing method gives the game less memory than your phone has. Update to the latest build (its "
          "presets follow the real limit) and, if you can, sign with the increased memory limit kept (GetMoreRam "
          "for free accounts). Lower Texture Cache if it still closes.",
    related=["DEV-04"],
    sources=["HANDOFF: The user's TODO list (2026-10-21 night) - Memory budgets by the app's limit",
             "HANDOFF: Testers' list (2026-10-22 evening)", "session: 21 Oct tester reports"],
)

# ---------------------------------------------------------------- device support

entry(
    id="DEV-01", category="device-support",
    title="Instant crash at launch on iOS 18 / iOS 26 (old 16 Oct IPA)",
    symptoms=["Crashes instantly when I open it / press Play", "Closes before anything shows"],
    log_signatures=["SIGABRT in dxmt::InternalCommandLibrary", "InternalCommandLibrary+212",
                    "Failed to create internal command library"],
    devices="iPhone 16 Pro Max (iOS 18.3 and iOS 26.2.1); also seen inside LiveContainer",
    os_versions="Any iOS below 27",
    cause="The graphics layer's built-in Metal library in the 16 Oct IPAs was built for iOS 27 only, so older iOS "
          "refused it at device creation.",
    player_fix=["Install any IPA from 17 Oct or later (the current release)."],
    fixed_in="16 Oct evening rebuild; every IPA since 17 Oct", released=True, status="fixed", still_open=False,
    reply="You have an IPA from 16 Oct that only works on iOS 27. Install the current GTAV-unsigned.ipa over it.",
    sources=["memory: shared-ipa", "HANDOFF: Ammu-Nation upgrade crash (tester reports)"],
)

entry(
    id="DEV-02", category="device-support",
    title="iOS 16: the game doesn't work (crash ~7 s after Play, or endless loading with nothing drawn)",
    symptoms=["Crashes a few seconds after Play on iOS 16", "Stuck loading for minutes, phone gets hot",
              "Nothing renders"],
    log_signatures=[
        "Failed to create MTLLibrary: ... This library format is not supported on this platform",
        "Compiler encountered an internal error",
        "SIGSEGV in DXMT pipeline-cache worker threads (compat thread ids 352/356)",
        "pipelines built: 0",
    ],
    devices="iPhone 13 on iOS 16.6.1 (the only iOS 16 report)",
    os_versions="iOS 16.x",
    cause="iOS 16's GPU shader compiler refuses every pipeline the graphics layer (DXMT) builds. The same shaders "
          "compile on newer iOS. The iOS 16 effort was dropped as not worth it.",
    player_fix=["Update iOS: every device that can run the game (A13 and newer) can run iOS 17 or later; iOS 18+ "
                "is confirmed working."],
    fixed_in=None, released=None, status="won't fix", still_open=False,
    notes="The IPA still says minimum iOS 16.3, so it installs on iOS 16 but can't run. No iOS 17 report yet.",
    reply="iOS 16 isn't supported: its graphics compiler rejects the game's shaders. Update to iOS 18 or newer.",
    related=["DEV-03"],
    sources=["memory: tester-reports-2026-10-17", "memory: device-floor",
             "HANDOFF: iOS 16: shader libraries refused, then a crash on the error"],
)

entry(
    id="DEV-03", kind="reference", category="device-support",
    title="Which devices run the game?",
    symptoms=["Will it run on my iPhone/iPad?", "Is iPhone 11 / XR / iPad X supported?"],
    log_signatures=[],
    devices="See fix list", os_versions="iOS 18+ confirmed; iOS 16 doesn't work; iOS 17 untested",
    cause="The graphics path needs Apple GPU family features; RAM decides the settings.",
    player_fix=[
        "Confirmed working (6 GB+): iPhone 12 Pro Max, 13 Pro, 14, 14 Pro, 14 Pro Max, 15, 15 Pro Max, 16, "
        "16 Pro Max, 17 Pro Max; iPad Pro M4, A16 iPad.",
        "A13 (iPhone 11 series): an iPhone 11 was verified running it (21 Oct).",
        "4 GB devices (iPhone 12/12 mini, iPhone 13/13 mini, iPad 10th gen, iPhone 11): run at the lowest preset "
        "(Battery Saver); iOS gives a 4 GB iPad about 2.9 GB. See DEV-04.",
        "A12 / A12X / A12Z (iPhone XS, XS Max, XR, iPad Pro 2018/2020): experimental path since the 24 Oct "
        "evening test build, in every release since 25 Oct. An A12Z iPad Pro ran it with no visual glitches; "
        "no XS/XR has reported. The XR's 3 GB is probably too little.",
        "Not supported: A11 and older; iOS 16.",
        "Mac: Apple silicon (M1 or later), macOS 14 Sonoma or later (Mac app since 25 Oct).",
    ],
    fixed_in=None, released=None, status="reference", still_open=False,
    reply="",
    related=["DEV-02", "DEV-04", "DEV-05"],
    sources=["memory: device-floor", "memory: a12-tier1-prototype", "memory: ipad-support",
             "memory: tester-reports-2026-10-17", "test_20261024_evening testers.md"],
)

entry(
    id="DEV-04", category="device-support",
    title="4 GB devices: crashes, closes, or stuck screens at higher settings",
    symptoms=["Keeps closing on my iPhone 12 / iPhone 13 / iPad 10th gen", "Out of memory on a 4 GB device",
              "Black screen in a mission on a 4 GB phone"],
    log_signatures=["[macport] memory: iOS lets the game use 2867 MB", "[macport] low-memory profile (N MB of RAM)",
                    "[macport] rayfire", "[macport] load scene ... not loaded after N s"],
    devices="4 GB iPhones and iPads", os_versions="Any",
    cause="iOS lets a 4 GB device's game use roughly 2.3-2.9 GB. The low-memory budgets keep the game around "
          "1.9 GB, but tight streaming budgets also starved some scripted scenes (garages, the Merryweather "
          "freighter), fixed in later builds.",
    player_fix=[
        "Start with the lowest preset (Battery Saver) and keep Texture Quality Normal.",
        "Keep MSAA and Reflection MSAA Off (CRASH-05).",
        "Update to the latest build: the garage and Merryweather stalls on small budgets are fixed (FREEZE-01, FREEZE-02).",
    ],
    fixed_in="Low-memory profile since the first shared builds; budgets by limit batch 69 (21 Oct)",
    released=True, status="workaround", still_open=False,
    reply="On 4 GB devices start with the Battery Saver preset, Normal textures and MSAA/Reflection MSAA Off, "
          "and make sure you're on the latest build.",
    related=["SIGN-03", "FREEZE-01", "FREEZE-02", "CRASH-05"],
    sources=["memory: device-floor", "memory: ram-4gb-work", "memory: tester-reports-2026-10-22",
             "release_20261026 discord.md"],
)

entry(
    id="DEV-05", category="device-support",
    title="A12Z iPad Pro: random crashes during play",
    symptoms=["Random crashes every so often on an iPad Pro 2020", "Crash while driving or flying"],
    log_signatures=["brk #1 at phSimulator::ProcessPairListTask+652", "gtaSched", "ProcessPairListTask"],
    devices="iPad Pro 11\" 2nd gen (A12Z) on the A12 test build", os_versions="iOS 18.5",
    cause="A physics race: on Apple CPUs a lock's release doesn't order a later read the way the consoles' did, "
          "so a collision task could read a pair list before its count was settled and trip a bounds check.",
    player_fix=["Update to the 25 Oct release or newer."],
    fixed_in="Batch 82 (24 Oct evening test build, 25 Oct release)", released=True, status="fixed",
    still_open=False,
    notes="One 10 s hang flying the Lazer on that iPad (render thread waiting, DXMT in IOGPUResourceCreate for an "
          "occlusion-query buffer) was not acted on: single sample, still open.",
    reply="That physics crash is fixed in the 25 Oct build and newer. Please update.",
    sources=["HANDOFF: A12Z tester: it renders; a physics crash", "memory: batch81-82-controller-taxi-wheels"],
)

# ---------------------------------------------------------------- crashes

entry(
    id="CRASH-01", category="crash",
    title="Crash when scrolling weapon upgrades at Ammu-Nation",
    symptoms=["Game crashes in Ammu-Nation when I look through gun upgrades / attachments"],
    log_signatures=["0xddddddddddddde35", "CPedEquippedWeapon::CreateWeaponComponent",
                    "GIVE_WEAPON_COMPONENT_TO_WEAPON_OBJECT", "gunclub_shop"],
    devices="Any (seen on an iPhone 13 Pro and a player's device)", os_versions="Any",
    cause="Removing a weapon finish in the shop preview left a stale pointer (original game bug the PC survives); "
          "the port's heap fills freed memory with 0xDD, so it crashes every time.",
    player_fix=["Update: fixed since the 17 Oct afternoon IPA (all releases since 18 Oct)."],
    fixed_in="Batch 58 (17 Oct shared IPA, 18 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed since 17 Oct. Install the current build.",
    related=["CRASH-02"],
    sources=["memory: dd-fill-latent-uaf", "HANDOFF: Ammu-Nation upgrade crash"],
)

entry(
    id="CRASH-02", category="crash",
    title="Crash at an address like 0xdddddddddddddddd: use-after-free in the original game code",
    symptoms=["A crash in a part of the game nobody reported before"],
    log_signatures=["0xdddddddddddddddd", "0xdddd", "freed memory (0xDD fill) = use-after-free"],
    devices="Any", os_versions="Any",
    cause="The port's heap fills freed memory with 0xDD, so latent use-after-free bugs in Rockstar's code (which "
          "the PC game survives by luck) crash here every time. Each one needs its own code fix.",
    player_fix=["Send the Logs folder and say exactly what you were doing (shop, mission, menu). "
                "Load an earlier save and avoid that action until a fix ships."],
    fixed_in="Per case (Ammu-Nation: batch 58)", released=None, status="open category", still_open=True,
    reply="That's a bug in the original game code that only shows on the port. Please send the whole Logs folder "
          "and what you were doing so it can be fixed.",
    related=["CRASH-01"],
    sources=["memory: dd-fill-latent-uaf"],
)

entry(
    id="CRASH-03", category="crash",
    title="Crash when reloading (Nervous Ron sniper, assault rifle, carbine, special carbine)",
    symptoms=["Crash when I reload", "Crash in Nervous Ron at the sniper spot",
              "Assault rifle / carbine rifle / special carbine crash the game on reload",
              "Crash after hours of play on an iPad Pro M4"],
    log_signatures=["CTaskReloadGun::CreateHeldClipObject", "CEntity::SetModelId", "model index 0xffff",
                    "fault at 0x51", "trevor2",
                    "[macport] reload: no model 0x........ (name) for the prop in the hand",
                    "[macport] no model for a new object|ped ... skipped instead of crashing"],
    devices="iPad Pro M4 (iOS 27.0), iPhone 13 Pro; any device with a weapon finish",
    os_versions="Any",
    cause="Ammu-Nation finishes (e.g. the Luxe and Lowrider finishes) swap in their own magazine model, which "
          "lives in Online DLC packs the phone data leaves out. The reload created a prop with no model.",
    player_fix=[
        "Update to the 23 Oct release or newer (crash guarded since 22 Oct; finish parts handled since 23 Oct).",
        "On an older build: remove the finish from the weapon at Ammu-Nation.",
    ],
    fixed_in="Batch 72 (22 Oct release, guard) + batch 75 (23 Oct release)", released=True, status="fixed",
    still_open=False,
    reply="That reload crash came from weapon finishes whose parts aren't in the phone data. It's fixed since the "
          "22-23 Oct builds; update, or remove the finish on an older build.",
    sources=["memory: tester-reports-2026-10-21", "memory: testers-list-batch75",
             "HANDOFF: Unknown models no longer crash entity creation"],
)

entry(
    id="CRASH-04", category="crash",
    title="Taking a photo with the in-game phone camera crashes the game",
    symptoms=["Game closes when I take a picture with the phone", "Photos come out squeezed with black bars"],
    log_signatures=["CHighQualityScreenshot::StoreScreenShotInBuffer", "SaveRGBA8SurfaceToJPEG",
                    "empty_output_buffer", "fwAssetStore<grcTexture>::~fwAssetStore",
                    "Output file write error --- out of disk space?"],
    devices="All (iPhone, iPad, Mac)", os_versions="Any",
    cause="A memory-stream address parsed wrong on Apple platforms, so the photo's JPEG couldn't be written and "
          "the image library quit the game. iPhone photos were also pillarboxed 4:3 at 19.5:9.",
    player_fix=["Update to the 20 Oct release or newer."],
    fixed_in="Batch 64 (20 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 20 Oct build and newer (photos also have the right shape now). Please update.",
    sources=["memory: photo-crash-batch64", "HANDOFF: Photo crash; the damaged Lite entries"],
)

entry(
    id="CRASH-05", category="crash",
    title="Crash about 25 s after loading a save: Reflection MSAA (or MSAA) set to 8x",
    symptoms=["Crashes every time right after the save loads", "Crash after changing graphics settings",
              "Crashes when loading into the world, memory is fine"],
    log_signatures=["sample count 8 is not supported", "ReflectionMSAA: 8",
                    "CreateTexture2D ... E_INVALIDARG (80070057)", "80070057",
                    "CViewportManager::CreateFinalScreenRenderPhaseList",
                    "grcRenderTargetDX11::CreateFromTextureObject", "read from 0x0"],
    devices="iPhone 12 (A14, 4 GB) on the 24 Oct build; any Apple GPU (Mac too)",
    os_versions="iOS 26.1 reported; any",
    cause="Apple GPUs support at most 4x MSAA. The launcher and the in-game menu offered 8x up to the 26 Oct "
          "release; the game builds the water reflection targets with 8 samples, the graphics layer refuses, and "
          "the game uses the missing texture.",
    player_fix=[
        "Launcher > Graphics: set Reflection MSAA to Off (best on 4 GB devices), 2x or 4x.",
        "Keep MSAA below 8x too (launcher Display page). Never pick 8x in the pause menu's Graphics page: it still "
        "offers it.",
        "From the 27 Oct launcher update on, the launcher only offers Off / 2x / 4x, and a saved 8x shows as 4x and "
        "is written as 4x when you press Play.",
        "Mac app (no launcher): keep both below 8x in the pause menu.",
        "Main-frame MSAA isn't recommended at all: two of its shaders don't build on Apple GPUs (see notes). Use "
        "FXAA or Temporal AA instead.",
    ],
    fixed_in="Launcher only (compat launcher.mm, 27 Oct test IPA GTAV-unsigned.msaa-launcher-20261027.ipa); the game "
             "and its pause menu are unchanged by the maintainer's choice",
    released=False, status="launcher limit in a test build (not released); workaround", still_open=True,
    notes="27 Oct Mac checks: the 26 Oct build with Reflection MSAA 8x crashed 12.6 s in exactly like the tester "
          "(\"sample count 8 is not supported\", then CreateFromTextureObject reading 0x0); Reflection MSAA 4x ran "
          "2 min in the world (47 FPS). Main MSAA 2x with the 26 Oct Mac graphics layer ran 2 min without a crash, "
          "but two MSAA pixel shaders fail to build on the M1 (\"Undefined symbols: llvm.agx2.sample.itrproj.1xf\") "
          "and their draws are skipped; with the older 15 Oct Mac graphics layer MSAA 4x crashed in "
          "drawPrimitives on the dxmt-encode thread. A game-side cap was built and dropped (maintainer: launcher only).",
    reply="Your Reflection MSAA is set to 8x, which Apple GPUs can't do. In the launcher go to Graphics and set "
          "Reflection MSAA to Off, 2x or 4x (and keep MSAA below 8x; Off is best). Don't pick 8x in the pause menu.",
    related=["DEV-04"],
    sources=["session of 27 Oct (crash-20261026-224929 analysis)"],
)

entry(
    id="CRASH-06", category="crash",
    title="Full Screen vertical mode: crash when switching pause-menu tabs; HUD in the middle; phone cut off",
    symptoms=["Crash when I open the pause menu and move between tabs in vertical mode",
              "Top-right HUD sits in the middle of the screen upright", "The phone is cut off in Full Screen vertical mode"],
    log_signatures=["GetMenuGraphicsSettings", "atArray", "SIGTRAP"],
    devices="iPhones in Full Screen vertical mode", os_versions="Any",
    cause="On an upright screen the resolution list came out empty, and the menu's graphics page indexed it. The "
          "HUD and phone were placed for a landscape band.",
    player_fix=["Update to the 24 Oct release or newer.", "On an older build: Vertical Mode Off or Dual Screen."],
    fixed_in="Batch 80 (24 Oct release)", released=True, status="fixed", still_open=False,
    notes="Known gaps in Full Screen vertical mode: loading and warning screens are cropped at the sides.",
    reply="Fixed in the 24 Oct build and newer. Update, or turn Vertical Mode off on an older build.",
    sources=["memory: full-screen-vertical-batch80", "memory: todo-2026-10-23"],
)

entry(
    id="CRASH-07", category="crash", platforms=["macOS"],
    title="Mac: rare crash on the loading screen right after start",
    symptoms=["The Mac app crashed during the first loading screen; the next start worked"],
    log_signatures=["CTimeCycle::SetupRenderThreadFrameInfo", "AddDrawList_BeginRender",
                    "write to 0x3f8000004040c80e"],
    devices="Mac (M1), seen on the developer's Mac only", os_versions="macOS 27",
    cause="Unknown. Seen in about 1 of 3 starts on one day (21 Oct) and once more on 26 Oct; never from players.",
    player_fix=["Start the game again.", "If it happens to you, send ~/Library/Logs/GTA5 (crash-*.txt and run.log)."],
    fixed_in=None, released=None, status="open", still_open=True,
    reply="That's a known rare start-up crash on the Mac; start the game again. Please send ~/Library/Logs/GTA5 so "
          "we get more samples.",
    sources=["HANDOFF: The Mac on the phone data", "HANDOFF: By the Book's tooth (Mac check)"],
)

# ---------------------------------------------------------------- freezes / soft locks

entry(
    id="FREEZE-01", category="freeze-softlock",
    title="Stuck at the door of a bought garage (Vinewood, Grove Street, Pillbox Hill)",
    symptoms=["Soft lock when entering my garage", "Stuck while the garage door opens", "Happens with every character"],
    log_signatures=["vehicle_gen_controller", "[macport] load scene ... not loaded after N s",
                    "[macport] stream volume waits on"],
    devices="6 GB and 4 GB devices (phone streaming budgets)", os_versions="Any",
    cause="The garage entry waits, with no time-out, for the interior to finish streaming in; with phone budgets "
          "the 136 interior models never loaded while the camera still showed the street.",
    player_fix=["Update to the 21 Oct release or newer: after 10 s with only models missing the scene goes on."],
    fixed_in="Batch 68 (21 Oct release)", released=True, status="fixed", still_open=False,
    notes="Leaving the garage wasn't tested but has the same 10 s fallback.",
    reply="Fixed in the 21 Oct build and newer. Please update.",
    related=["FREEZE-02"],
    sources=["memory: garage-pedals-batch68", "HANDOFF: Pedals with the phone up; the story garages' soft lock"],
)

entry(
    id="FREEZE-02", category="freeze-softlock",
    title="The Merryweather Heist: black screen or frozen camera after the freighter explodes",
    symptoms=["Infinite loading / black screen after Franklin detonates the bombs and the ship starts exploding",
              "The mission stops there and the story can't continue",
              "Frozen camera on the sinking ship"],
    log_signatures=["docks_heista", "des_shipsink", "[macport] rayfire"],
    devices="4 GB devices (iPhone 13 4 GB reported)", os_versions="Any",
    cause="The mission waits, with no time-out, for the ship's destruction end state; on 4 GB budgets 122 of its "
          "229 models were never requested, so it never finished.",
    player_fix=["Update to the 26 Oct release or newer; load the save before the mission and replay it."],
    fixed_in="Batch 87 (26 Oct release)", released=True, status="fixed", still_open=False,
    notes="Confirmed on the developer's iPhone 13 Pro and on a player's 4 GB phone.",
    reply="Fixed in the 26 Oct build: the mission continues after the explosion. Update and replay it.",
    related=["FREEZE-01", "DEV-04"],
    sources=["memory: merryweather-rayfire-batch87", "HANDOFF: The Merryweather Heist stuck after the ship explodes"],
)

entry(
    id="FREEZE-03", category="audio",
    title="Game freezes on a phone call, a timer/alarm (Dynamic Island), Siri, or when Spotify plays",
    symptoms=["Game freezes when a timer goes off", "Freezes when I get a call", "I can't play Spotify with the game",
              "Game stuck after Siri"],
    log_signatures=["[macport] audio session: interrupted", "[macport] audio session: interruption ended",
                    "[macport] audio: output stopped (nothing taken for N ms): mixing on the clock",
                    "[macport] audio: output started again", "audNorthAudioEngine::FinishUpdate"],
    devices="All iPhones and iPads", os_versions="Any",
    cause="The game's update waited on the audio engine, which waited on iOS's audio callback. An interruption "
          "stopped the audio output and nothing restarted it, so the whole game stopped.",
    player_fix=[
        "Update to the 25 Oct release or newer: the game keeps running and the sound restarts by itself.",
        "Launcher > Audio > Music From Other Apps: Mix (default, Spotify plays along) or Stop It.",
    ],
    fixed_in="Batch 86 (25 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 25 Oct build and newer; other apps' music can now play along (launcher > Audio).",
    sources=["memory: batch86-audio-kbm-radio-macapp", "HANDOFF: The user's list (2026-10-25 evening)"],
)

entry(
    id="FREEZE-04", category="controls",
    title="Stick minigames can't be done on touch: By the Book (tooth), Did Somebody Say Yoga?, Reuniting the Family (tattoo)",
    symptoms=["Can't pull the tooth in By the Book: it says rotate the right stick",
              "The yoga poses are impossible on touch", "Stuck at the tattoo in Reuniting the Family",
              "Mission soft-locks because there's no right stick"],
    log_signatures=["fbi3", "hlp_PLIER2", "Rotate ~PAD_RSTICK_ROTATE~ to pull it out.", "yoga", "family5", "family6"],
    devices="All touch devices", os_versions="Any",
    cause="The camera area's right stick follows finger speed and drops to zero when the finger stops; these "
          "minigames need a held stick position. By the Book's pad text uses a token the prompt scan skipped "
          "until 26 Oct.",
    player_fix=[
        "Update to the 26 Oct release or newer.",
        "By the Book: hold RT to grip, then the right stick appears under your left thumb; or tap Auto rotate.",
        "Yoga: sticks hold their position; use the Auto pose toggle and the LT+RT button to breathe (21 Oct+).",
        "Tattoo: the right side becomes a real right stick while the prompt shows (21 Oct+).",
        "A controller also works.",
    ],
    fixed_in="Right-stick mode + yoga Auto pose: 21 Oct release (compat + batch 69); By the Book: batch 88, 26 Oct release",
    released=True, status="fixed", still_open=False,
    notes="By the Book confirmed on an iPhone 13 Pro; the yoga Auto pose and tattoo were only tested in the touch harness.",
    reply="Update to the 26 Oct build: By the Book puts the right stick under your left thumb (or tap Auto rotate) "
          "and the yoga has an Auto pose button.",
    sources=["memory: by-the-book-tooth-batch88", "memory: touch-prompts", "memory: todo-2026-10-21",
             "HANDOFF: Minigames that need a real right stick"],
)

entry(
    id="FREEZE-05", category="controls",
    title="Can't get past the brightness screen at the first start",
    symptoms=["Stuck on the brightness/calibration screen", "No buttons on the first screen"],
    log_signatures=["CDisplayCalibration"],
    devices="All touch devices (first start, no controller)", os_versions="Any",
    cause="The first-start calibration runs its own loop before any HUD update, so touch buttons never appeared.",
    player_fix=["Update to the 22 Oct release or newer (Darker / Brighter / Accept buttons).",
                "On an older build: connect a controller to accept."],
    fixed_in="Batch 71 (22 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 22 Oct build and newer (Darker, Brighter, Accept). Update, or use a controller on an old build.",
    sources=["memory: batch71-brightness-browser-fps"],
)

# ---------------------------------------------------------------- gameplay

entry(
    id="GAME-01", category="gameplay",
    title="Money is $0 after loading a save or after Wasted/Busted; shops refuse cheat money",
    symptoms=["Money doesn't save", "$0 after I die or get busted", "Cheat says +$100,000 but the shop says I can't afford it"],
    log_signatures=["[macport] cash:", "main takes SP1's stat N into its balance"],
    devices="All", os_versions="Any",
    cause="Story scripts only read the saved money back when an online profile is signed in; the port never has "
          "one, so every load zeroed the balance and money added by game code never reached it.",
    player_fix=["Update to the 21 Oct release or newer. Existing saves get their money back on load (it was saved; "
                "only the balance was lost)."],
    fixed_in="Batch 67 (21 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed since the 21 Oct build; loading your save restores the money that was saved.",
    sources=["memory: story-money-batch67", "HANDOFF: Story money"],
)

entry(
    id="GAME-02", category="gameplay",
    title="Multi Target Assassination: the timer runs out before all targets are done",
    symptoms=["Not enough time in the Multi Target Assassination", "The time runs out too quickly"],
    log_signatures=["assassin_multi", "[macport] assassin_multi: time limit 9 -> 18 minutes (2 of 2 places)"],
    devices="All touch devices", os_versions="Any",
    cause="Not a port bug: the original limit is 9 minutes of game time and the clock runs normally. Driving "
          "across the city on touch is just slower.",
    player_fix=["Update to the 21 Oct release or newer: on iOS the mission gives 18 minutes."],
    fixed_in="Batch 70 (21 Oct release)", released=True, status="fixed", still_open=False,
    reply="The 21 Oct build and newer give that mission 18 minutes on iOS instead of 9.",
    sources=["HANDOFF: The Multi Target Assassination's time limit", "memory: todo-2026-10-21"],
)

entry(
    id="GAME-03", category="gameplay",
    title="Can't cross rivers; the current pushes you to one bank (e.g. Predator, Raton Canyon)",
    symptoms=["Franklin can't swim across the river", "The river throws me to the other side and I can't come back",
              "River current far too strong"],
    log_signatures=[],
    devices="iPhones, iPads (and the Mac on phone data)", os_versions="Any",
    cause="The river flow maps were read in the wrong texture format on the converted data, giving a current about "
          "8x too strong, always towards the south.",
    player_fix=["Update to the 22 Oct second update or newer."],
    fixed_in="Batch 74 (22 Oct second update)", released=True, status="fixed", still_open=False,
    reply="Fixed since the 22 Oct second update. Please update.",
    sources=["memory: river-current-batch74"],
)

entry(
    id="GAME-04", category="gameplay",
    title="Taxi rides cost $0 and give a wanted level while wearing a trainer skin",
    symptoms=["Taxis are free and I get a star", "Taxi meter shows 00000"],
    log_signatures=["taxiservice"],
    devices="All", os_versions="Any",
    cause="With a trainer skin the player isn't a story character, so the taxi script charged nobody and treated "
          "it as fare-dodging.",
    player_fix=["Update to the 25 Oct release or newer (the taxi charges the story character you were).",
                "A meter showing 00000 on Skip Trip is normal: the fare only counts while riding."],
    fixed_in="Batch 81 (25 Oct release)", released=True, status="fixed (not yet tried in a real cab ride)",
    still_open=False,
    reply="Fixed in the 25 Oct build and newer: taxis charge the story character you were before the skin.",
    sources=["memory: batch81-82-controller-taxi-wheels"],
)

entry(
    id="GAME-05", category="gameplay",
    title="Cheats picked from the touch menu don't work",
    symptoms=["Cheats don't do anything", "I picked a cheat in the pause menu but nothing happened"],
    log_signatures=["cheat_controller"],
    devices="All touch devices", os_versions="Any",
    cause="Cheats chosen from the menu (opened from the pause menu) were handed over while the game was paused "
          "and dropped after 2 s.",
    player_fix=["Update to the 24 Oct release or newer: picks wait until you're back in control."],
    fixed_in="Batch 78 (24 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 24 Oct build and newer: cheats apply once you unpause.",
    sources=["memory: trainer-shadows-batch78-79"],
)

entry(
    id="GAME-06", category="gameplay",
    title="Trainer interior teleports: places stay open or look odd afterwards",
    symptoms=["After teleporting into an interior a building looks wrong / doubled",
              "A closed place stays open", "Loaded a save made inside an interior and something is off"],
    log_signatures=[],
    devices="All", os_versions="Any",
    cause="28 of the 150 interiors are places story mode keeps closed; teleporting there unlocks them (and for 12 "
          "loads an optional map file, sometimes a building's mission version) until a story script resets it or "
          "the app is quit. Saves don't store this.",
    player_fix=[
        "Quit and relaunch the app to reset everything.",
        "Don't save while standing inside a teleported-to interior.",
        "Teleporting during a mission can fail the mission, like any teleport; using none of this changes nothing.",
    ],
    fixed_in="Trainer interiors: batch 85 (25 Oct release)", released=True, status="by design (caveat)",
    still_open=True,
    notes="Closing a place again on leaving was offered, not built. Playing a story mission after a teleport is untested.",
    reply="Interior teleports can leave some places open until you quit the app. Relaunch to reset, and don't "
          "save inside one.",
    sources=["session of 25 Oct (interiors trainer)", "memory: trainer-interiors-batch85"],
)

entry(
    id="GAME-07", kind="reference", category="gameplay",
    title="GTA Online, Social Club, ONLINE/FRIENDS/STORE tabs",
    symptoms=["How do I play online?", "Social Club doesn't work", "Where did the ONLINE tab go?"],
    log_signatures=[],
    devices="All", os_versions="Any",
    cause="The port is story mode only: there is no signed-in Social Club profile, and Online can't work.",
    player_fix=["Story mode only. The ONLINE, FRIENDS and STORE pause-menu tabs were removed in the 23 Oct release."],
    fixed_in=None, released=None, status="by design", still_open=False,
    reply="The port is story mode only; GTA Online and Social Club don't work on it.",
    sources=["memory: testers-list-batch75", "HANDOFF: Story money"],
)

entry(
    id="GAME-08", kind="reference", category="gameplay",
    title="Exit Game goes back to the launcher instead of quitting",
    symptoms=["Exit Game doesn't close the app", "How do I restart the game?"],
    log_signatures=[],
    devices="iPhone, iPad", os_versions="Any",
    cause="Since the 22 Oct release Exit Game returns to the launcher (CONTINUE / \"Quit the game\"). iOS doesn't "
          "let an app relaunch itself, so a fresh start needs a quit and a manual reopen.",
    player_fix=["CONTINUE returns to the game; \"Quit the game\" closes it; then open the app again for a fresh start. "
                "Settings changed there apply at the next start."],
    fixed_in="Batch 73 (22 Oct release)", released=True, status="by design", still_open=False,
    reply="",
    sources=["memory: todo-2026-10-22", "release_20261022 README"],
)

# ---------------------------------------------------------------- controls

entry(
    id="CTRL-01", category="controls",
    title="No lock-on, can't snap to the next target while aiming",
    symptoms=["No aim assist on touch", "On a console holding LT and moving the stick snaps to the next target; here it doesn't",
              "Aiming doesn't lock on"],
    log_signatures=["TARGETING_MODE"],
    devices="All (touch and controller)", os_versions="Any",
    cause="The PC build's default Targeting Mode is Free Aim (consoles default to Assisted Aim). Free Aim has no "
          "lock-on, so there's nothing to switch between.",
    player_fix=[
        "Pause menu > Settings > Controls > Targeting Mode: Assisted Aim - Full (or Partial).",
        "With lock-on, a quick sideways flick in the look area (about 450 pt/s) switches targets.",
    ],
    fixed_in=None, released=None, status="settings", still_open=True,
    notes="An iOS default of Assisted Aim for new profiles was offered, not built.",
    reply="The PC default is Free Aim, which has no lock-on. Go to Settings > Controls > Targeting Mode and pick "
          "Assisted Aim; then a quick sideways flick switches targets.",
    sources=["memory: targeting-mode-free-aim-default"],
)

entry(
    id="CTRL-02", category="controls",
    title="No gas/brake while the in-game phone is up in a car",
    symptoms=["Can't accelerate or brake with the phone out", "Phone up while driving switches to a joystick"],
    log_signatures=[],
    devices="All touch devices", os_versions="Any",
    cause="With the phone up the touch layout was the phone's (d-pad, select, back) without driving controls.",
    player_fix=["Update: Gas/Brake show above the phone since the 21 Oct release; the steering arrows stay since 23 Oct."],
    fixed_in="Batch 68 (21 Oct release) + batch 75 (23 Oct release)", released=True, status="fixed",
    still_open=False,
    reply="Fixed since the 21 Oct build (Gas/Brake above the phone). Please update.",
    sources=["memory: garage-pedals-batch68", "memory: testers-list-batch75"],
)

entry(
    id="CTRL-03", category="controls",
    title="In-game internet / menus: pointer stuck in the top-left corner, taps land in the wrong place",
    symptoms=["Browser pointer stuck top-left", "Taps in the internet don't hit what I tap",
              "Menu taps drift right and down at 1280x720 / 1152x648"],
    log_signatures=[],
    devices="iPhones (wide screens)", os_versions="Any",
    cause="In the world the game locks and hides the cursor, so touch points were ignored; and the cursor was "
          "scaled by the 16:9 frame instead of the wider window.",
    player_fix=["Update to the 22 Oct release or newer (tap to click, drag to scroll, Back/Close/Up/Down)."],
    fixed_in="Compat fix + batch 73 (22 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 22 Oct build and newer. Please update.",
    sources=["memory: batch71-brightness-browser-fps", "memory: todo-2026-10-22"],
)

entry(
    id="CTRL-04", category="controls",
    title="Forklift: Lower (LS) doesn't respond, Lift works",
    symptoms=["Can't lower the forklift forks on touch"],
    log_signatures=[],
    devices="Touch devices", os_versions="Any",
    cause="Not reproduced: the touch overlay sends the left stick down as expected.",
    player_fix=["Try a controller; send Logs and a screen recording if it keeps happening."],
    fixed_in=None, released=None, status="open (not reproduced)", still_open=True,
    reply="We couldn't reproduce that one yet. Please send a short screen recording and the Logs folder.",
    sources=["memory: todo-2026-10-22 (batch 73 feedback)"],
)

# ---------------------------------------------------------------- graphics

entry(
    id="GFX-01", category="graphics",
    title="Mission markers and race checkpoints look like a solid yellow (or blue) wall",
    symptoms=["Yellow marker is a solid wall", "Checkpoints are solid blue walls"],
    log_signatures=[],
    devices="iPhones/iPads at DirectX 10", os_versions="Any",
    cause="At DirectX 10 the marker mesh was drawn as points, which the A15 rendered as a wall.",
    player_fix=["Update to the 21 Oct release or newer (DirectX 11 is also the default since then).",
                "On an older build: set DirectX 11 in the launcher."],
    fixed_in="Batch 69 (21 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed since the 21 Oct build; on older builds switch to DirectX 11.",
    sources=["memory: todo-2026-10-21", "HANDOFF: Markers as a solid yellow wall"],
)

entry(
    id="GFX-02", category="graphics",
    title="Broken textures on an M-series iPad after turning on \"Original BC Textures\"",
    symptoms=["Textures garbled / wrong on my M4 iPad", "Everything looks broken after a launcher setting"],
    log_signatures=["nativeBC", "DXMT_FORCE_BC_DECODE"],
    devices="M-series iPads", os_versions="Any",
    cause="The converted phone data needs the ETC texture path; the toggle made M-series iPads read them as PC textures.",
    player_fix=["Update to the 21 Oct release or newer: the toggle is gone and M-series iPads always use the right path."],
    fixed_in="Batch 69 (21 Oct release)", released=True, status="fixed", still_open=False,
    reply="Update to the latest build; the setting that broke textures was removed on 21 Oct.",
    sources=["HANDOFF: The user's TODO list (2026-10-21 night)", "memory: ipad-support"],
)

entry(
    id="GFX-03", category="graphics",
    title="No shadows in cutscene close-ups",
    symptoms=["Cutscenes have no shadows on faces", "Cutscene lighting looks flat"],
    log_signatures=[],
    devices="Devices at Shadow Quality Normal", os_versions="Any",
    cause="At Shadow Quality Normal the sun's shadow map was 16-bit, too coarse for cutscene close-ups.",
    player_fix=["Update to the 24 Oct release or newer.", "Cutscene depth of field has its own toggle in the "
                "launcher (HUD & Controls) since 24 Oct."],
    fixed_in="Batch 79 (24 Oct release)", released=True, status="fixed", still_open=False,
    reply="Fixed in the 24 Oct build and newer. Please update.",
    sources=["memory: trainer-shadows-batch78-79"],
)

entry(
    id="GFX-04", category="graphics",
    title="Dark blue screen with command-line text while the game starts",
    symptoms=["Blue screen full of text at start", "\"Now loading Grand Theft Auto V...\" on blue"],
    log_signatures=["CSystem::RenderBuildInformation"],
    devices="All", os_versions="Any",
    cause="A build-information splash from the non-final game build. Harmless.",
    player_fix=["Nothing needed; gone since the 22 Oct release (now a black frame)."],
    fixed_in="Batch 73 (22 Oct release)", released=True, status="fixed", still_open=False,
    reply="That screen is harmless and gone since the 22 Oct build.",
    sources=["memory: todo-2026-10-22"],
)

entry(
    id="GFX-05", category="graphics",
    title="Wrong colours or blocky patches after the 26 Oct update",
    symptoms=["Wrong colours since the latest update", "Blocky patches on surfaces"],
    log_signatures=["[macport] gpu:"],
    devices="Any chip other than the A15 (only the A15 was tested)", os_versions="Any",
    cause="The 26 Oct release turned the GPU's lossless memory compression back on (about +19% FPS on an A15). "
          "No artifacts were seen on the A15; other chips are untested.",
    player_fix=["Send a screenshot, the device model and the Logs folder."],
    fixed_in=None, released=None, status="watch (no reports yet)", still_open=True,
    reply="Thanks, please send a screenshot, your device model and the Logs folder: the 26 Oct GPU change was only "
          "tested on an iPhone 13 Pro.",
    sources=["memory: gpu-profile-batch91", "release_20261026 discord.md"],
)

# ---------------------------------------------------------------- performance

entry(
    id="PERF-01", category="performance",
    title="Stuck at 30 or 60 FPS; 90/120/40 FPS options missing",
    symptoms=["Capped at 30 FPS", "Frame Limiter Off is still 60 FPS", "No 120 FPS option", "Where is 40 FPS?"],
    log_signatures=["[macport] frame limit", "[macport] display: up to 120 Hz"],
    devices="All; 90/120 need a 120 Hz screen", os_versions="Any",
    cause="Old defaults Windowed + VSync Half capped the game at 30 FPS (switched once to Fullscreen/VSync Off in "
          "the 18 Oct release). Frame Limiter Off ran at 60 on ProMotion screens until 21 Oct. 90/120 FPS steps came "
          "on 22 Oct (VSync must be Off), 40 FPS on 26 Oct.",
    player_fix=[
        "Update to the latest build.",
        "Launcher: Screen Type Fullscreen, VSync Off, then pick the Frame Limiter step.",
        "Steps above the screen's refresh rate are hidden (144 never shows on iPhone/iPad).",
        "If you go back to a build older than 26 Oct after choosing 40 FPS, the limiter reads Off.",
    ],
    fixed_in="18 Oct (defaults), batch 69 21 Oct (Off), batch 71 22 Oct (90/120), batch 89 26 Oct (40)",
    released=True, status="fixed", still_open=False,
    reply="Set Fullscreen and VSync Off in the launcher, then choose the Frame Limiter step; 90/120 need a 120 Hz "
          "screen and the latest build.",
    sources=["memory: todo-2026-10-18", "memory: todo-2026-10-21", "memory: batch71-brightness-browser-fps",
             "memory: frame-limiter-40fps-batch89"],
)

entry(
    id="PERF-02", category="performance",
    title="30 FPS isn't smooth / input lag",
    symptoms=["30 FPS shows 33.3 ms but still stutters", "Controls feel laggy at 30 FPS"],
    log_signatures=["[macport] display:"],
    devices="All", os_versions="Any",
    cause="Frames were handed to the screen with drifting timing (some held 50 ms). Input lag of ~100 ms at 30 FPS "
          "is the game's own frame pipeline.",
    player_fix=["Update to the 23 Oct release or newer (presents wait for the screen).",
                "For less lag, use a higher limit: 40 FPS on 120 Hz screens, or 60."],
    fixed_in="Frame pacing (DXMT present wait), 23 Oct release", released=True, status="fixed", still_open=False,
    reply="Frame pacing was fixed in the 23 Oct build. For less input lag, try 40 FPS (120 Hz screens) or 60.",
    sources=["memory: frame-pacing-present-wait"],
)

entry(
    id="PERF-03", category="performance",
    title="FPS drops, phone gets hot",
    symptoms=["FPS drops after the update", "Phone gets very hot and FPS falls", "60 FPS at first, then 40-50"],
    log_signatures=["thermal serious", "thermal critical", "[macport] gpu: N ms a frame"],
    devices="All iPhones", os_versions="Any",
    cause="Heat, not the GPU's top speed, is the limit: an iPhone 13 Pro holds 60 FPS at thermal \"fair\" and drops "
          "to 40-50 at serious/critical. FPS-drop reports after the 20 Oct release found no cause in the code "
          "(Mac A/B identical).",
    player_fix=[
        "Use a 30 or 40 FPS cap (cooler and steadier).",
        "Update to the 26 Oct release: GPU compression back on (about a sixth less GPU work per frame) and MetalFX "
        "capped at the screen's resolution.",
        "Lower Frame Scaling / resolution or use a lower preset.",
        "Send the Logs folder: run.log has FPS, slowest frames, memory and thermal state every 10 s.",
    ],
    fixed_in="Batch 91 GPU changes (26 Oct release)", released=True, status="workaround", still_open=True,
    reply="Heat is the main limit on phones. Use a 30 or 40 FPS cap and the 26 Oct build (less GPU work). If it "
          "still drops, send the Logs folder.",
    sources=["memory: device-floor", "memory: crash-logging-batch66 (FPS drop reports)",
             "HANDOFF: FPS drop reports after the 20 Oct release", "memory: gpu-profile-batch91"],
)

# ---------------------------------------------------------------- mac

entry(
    id="MAC-01", category="mac", platforms=["macOS"],
    title="Mac: \"macOS can't check the app\" / GTA V was blocked",
    symptoms=["The Mac app won't open the first time", "macOS says the app is damaged or can't be verified"],
    log_signatures=[],
    devices="Apple silicon Macs", os_versions="macOS 14+",
    cause="The Mac app isn't notarized, so Gatekeeper blocks the first start.",
    player_fix=[
        "Right-click (Control-click) GTA V.app > Open > Open.",
        "macOS 15 and later: open it once, then System Settings > Privacy & Security > \"GTA V\" was blocked > Open Anyway.",
        "Or in Terminal: xattr -dr com.apple.quarantine \"/path/to/GTA V.app\"",
    ],
    fixed_in=None, released=None, status="not a bug", still_open=False,
    reply="Right-click GTA V.app > Open > Open (on macOS 15+: System Settings > Privacy & Security > Open Anyway).",
    sources=["mac_release_20261026 README.txt"],
)

entry(
    id="MAC-02", category="mac", platforms=["macOS"],
    title="Mac: game data not found, TVs dark, patch step",
    symptoms=["Mac app asks for the game folder", "TVs are dark on the Mac"],
    log_signatures=[],
    devices="Apple silicon Macs", os_versions="macOS 14+",
    cause="The Mac app uses the same GTAV folder as the iPhone. A PC install's folder works but has no converted "
          "movies, so TVs stay dark.",
    player_fix=[
        "Put the GTAV folder beside the app or in Documents/GTAV; otherwise pick it at the first start.",
        "If the phone data wasn't patched, put GTAV_patch beside GTAV before the first start (applied once).",
        "For TVs, the GTAV folder needs the movies folder (DATA-05).",
        "Logs: Finder > Go > Go to Folder > ~/Library/Logs/GTA5.",
    ],
    fixed_in=None, released=None, status="player setup", still_open=False,
    reply="",
    related=["DATA-03", "DATA-05"],
    sources=["mac_release_20261026 README.txt"],
)


# ---------------------------------------------------------------- output

SKIPPED = [
    ("Developer-only Mac crash reports in ~/Library/Logs/GTA5 (4-23 Oct)",
     "About 100 reports from the developer's own test runs: SIGTERM ends of test runs, crashes during development "
     "of features (mods folder, trainer) fixed before any build shipped. Only the open loading-screen crash is "
     "kept (CRASH-07)."),
    ("Launcher crash after ~20-30 s in the launcher (16 Oct)",
     "Developer's phone only; fixed in batch 55 before the first shared IPA."),
    ("Crash ~30 s into the 4 GB test config (15 Oct)",
     "Developer's phone, test config; fixed the same day before sharing."),
    ("Shadows drawn while the menu says Off (14 Oct)", "Fixed in batch 51, before the first shared IPA."),
    ("Ring/Silent switch muting the game (11 Oct)", "Fixed in batch 44, before the first shared IPA."),
    ("0.5 s freezes on the Mac (11 Oct)", "Development-time pacing work, not a player report."),
    ("Mac boot hang at the Local Network prompt (25 Oct)", "Found and fixed while building the first Mac app."),
    ("Suspended GTA5 process lingering without an app-switcher card (26 Oct)",
     "Seen only on the developer's phone; no drain, no player impact."),
    ("The 28 damaged Lite data entries (destruction sets, parachute_decals, id2_17_void, mppilot)",
     "Checked 19 Oct: never registered, no mission loads them; no player symptom possible."),
    ("Feature requests in the same lists (vertical mode, trainer, mods, Self Radio, keyboard/mouse, controller in "
     "the launcher, language mods)", "Features, not problems; nothing a player needs to troubleshoot."),
    ("Jagged edges / shimmering (developer's 11 Oct TODO)", "A quality request answered with Temporal AA, not a report."),
]


def md_escape(text):
    return text.replace("|", "\\|")


def write_markdown(path):
    lines = []
    add = lines.append
    issues = [e for e in E if e["kind"] == "issue"]
    refs = [e for e in E if e["kind"] == "reference"]
    add("# GTA V iOS / iPadOS / macOS port: troubleshooting knowledge base")
    add("")
    add(f"Current release: **{CURRENT}**. Built on 27 Oct 2026 from the tester logs, crash reports and fixes of "
        "all earlier sessions. Same content as `kb.json`.")
    add("")
    add(f"{len(E)} entries: {len(issues)} issues and {len(refs)} reference entries. "
        f"{sum(1 for e in issues if e['still_open'])} issues are still open or need a player-side step.")
    add("")
    add("## Index")
    add("")
    add("| ID | Title | Status |")
    add("|---|---|---|")
    for e in E:
        add(f"| [{e['id']}](#{e['id'].lower()}) | {md_escape(e['title'])} | {e['status']} |")
    add("")
    order = ["reference", "setup", "install-signing", "device-support", "crash", "freeze-softlock", "audio",
             "gameplay", "controls", "graphics", "performance", "mac"]
    names = {"reference": "Reference", "setup": "Game data and setup", "install-signing": "Installing and signing",
             "device-support": "Devices and iOS versions", "crash": "Crashes", "freeze-softlock": "Freezes and soft locks",
             "audio": "Audio", "gameplay": "Gameplay", "controls": "Controls", "graphics": "Graphics",
             "performance": "Performance", "mac": "Mac"}
    for cat in order:
        group = [e for e in E if e["category"] == cat]
        if not group:
            continue
        add(f"## {names[cat]}")
        add("")
        for e in group:
            add(f"### {e['id']}")
            add("")
            add(f"**{e['title']}**")
            add("")
            add(f"- **Status:** {e['status']}" + (" (still open)" if e["still_open"] else ""))
            add(f"- **Platforms:** {', '.join(e['platforms'])}")
            add(f"- **Devices:** {e['devices']}")
            add(f"- **OS versions:** {e['os_versions']}")
            if e.get("fixed_in"):
                rel = {True: "released", False: "not released", None: ""}[e.get("released")]
                add(f"- **Fixed in:** {e['fixed_in']}" + (f" ({rel})" if rel else ""))
            add("")
            add("**Players say:**")
            add("")
            for s in e["symptoms"]:
                add(f"- {s}")
            add("")
            if e["log_signatures"]:
                add("**Log signatures:**")
                add("")
                for s in e["log_signatures"]:
                    add(f"- `{s}`")
                add("")
            add(f"**Cause:** {e['cause']}")
            add("")
            add("**Fix / what to do:**" if e["kind"] == "issue" else "**Details:**")
            add("")
            for i, s in enumerate(e["player_fix"], 1):
                add(f"{i}. {s}")
            add("")
            if e.get("notes"):
                add(f"**Notes:** {e['notes']}")
                add("")
            if e.get("reply"):
                add("**Reply to paste:**")
                add("")
                add(f"> {e['reply']}")
                add("")
            if e.get("related"):
                add(f"**Related:** {', '.join(e['related'])}")
                add("")
    add("## Deliberately left out")
    add("")
    for title, why in SKIPPED:
        add(f"- **{title}:** {why}")
    add("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    ids = [e["id"] for e in E]
    assert len(ids) == len(set(ids)), "duplicate ids"
    for e in E:
        for r in e["related"]:
            assert r in ids, f"{e['id']} links to unknown {r}"
    keys = ["id", "kind", "category", "title", "platforms", "symptoms", "log_signatures", "devices", "os_versions",
            "cause", "player_fix", "fixed_in", "released", "status", "still_open", "notes", "reply", "related",
            "sources"]
    data = [{k: e.get(k) for k in keys} for e in E]
    with open(os.path.join(out, "kb.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    write_markdown(os.path.join(out, "kb.md"))
    print(f"{len(E)} entries written to {out}")


main()

# Website-readable source links, regenerated together with JSON and Markdown.
from html import escape
from pathlib import Path
out = Path(sys.argv[1])
parts = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Developer troubleshooting notes | GTA V iOS</title><script src="settings.js"></script><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="settings-tones.css"><link rel="stylesheet" href="settings.css"><style>article{padding:30px 0;border-bottom:1px solid var(--line);scroll-margin-top:25px}li{margin:12px 0;line-height:1.8}code{overflow-wrap:anywhere}h2{font-size:25px}p{white-space:pre-line}</style></head><body><main class="page-wrap"><a href="home.html">Back to the project</a><h1 style="margin-top:35px">Developer troubleshooting notes</h1><p>Knowledge provided by XDE. Snapshot: 27 October 2026. A matching symptom is not a confirmed diagnosis.</p>']
for e in E:
    h = escape
    parts.append(f'<article id="{h(e["id"])}"><span>{h(e["id"])} · {h(e["status"])}</span><h2>{h(e["title"])}</h2><p>Platforms: {h(", ".join(e["platforms"]))}\nDevices: {h(e["devices"])}\nOS versions: {h(e["os_versions"])}</p><p>{h(e["cause"])}</p>')
    if e.get('fixed_in'):
        released = 'Released' if e.get('released') is True else 'Not released' if e.get('released') is False else 'Not specified'
        parts.append(f'<p>Fix/build: {h(e["fixed_in"])}\nRelease status: {released}</p>')
    parts.append('<ol>'+''.join('<li>'+h(s)+'</li>' for s in e['player_fix'])+'</ol>')
    if e.get('log_signatures'):
        parts.append('<details><summary>Log signatures</summary><ul>'+''.join('<li><code>'+h(s)+'</code></li>' for s in e['log_signatures'])+'</ul></details>')
    if e.get('notes'):
        parts.append('<p>'+h(e['notes'])+'</p>')
    parts.append('</article>')
parts.append('</main></body></html>')
(out.parent / 'developer-notes.html').write_text(''.join(parts), encoding='utf-8')
