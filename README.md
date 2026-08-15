# Mook

Mook is a portrait arcade score-chaser for the web and iOS. It begins with one green target and progressively introduces traps, directional swipes, holds, multi-tap rocks, checkpoints, streak multipliers, one checkpoint continue, and local high scores.

Playable web build: https://scoropolis.github.io/mook-game/

## Web development

```sh
npm install
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765`.

Run the browser regression test:

```sh
npm test
```

## iOS development

The native app uses Capacitor 8 and bundles the game for offline play.

```sh
npm install
npm run ios:sync
npm run ios:open
```

The iOS target is configured as:

- App name: `Mook`
- Bundle ID: `com.scoropolis.mook`
- Deployment target: iOS 15+
- Orientation: portrait
- Native integrations: Haptics, Preferences, Share Sheet, Game Center, AdMob, Splash Screen, Status Bar, app lifecycle

Build an unsigned simulator app from the command line:

```sh
npm run ios:build
```

## Native service configuration

Development builds use Google's official sample AdMob app and interstitial identifiers. These cannot generate revenue. Production placeholders and replacement instructions are documented in [`STORE_CONFIGURATION.md`](STORE_CONFIGURATION.md).

Game Center expects a leaderboard identifier of `mook_high_score`. Create it in App Store Connect after enrolling in the Apple Developer Program.

## App Store preparation

- Listing copy and review notes: [`AppStore/METADATA.md`](AppStore/METADATA.md)
- Release checklist: [`AppStore/RELEASE_CHECKLIST.md`](AppStore/RELEASE_CHECKLIST.md)
- Privacy policy: [`privacy.html`](privacy.html)
- Support page: [`support.html`](support.html)
- Source icon and splash images: [`assets/`](assets/)

The remaining account-bound work is Apple Developer signing, creation of the App Store Connect record and Game Center leaderboard, replacement of AdMob test IDs, physical-device/TestFlight testing, final screenshots, and submission.
