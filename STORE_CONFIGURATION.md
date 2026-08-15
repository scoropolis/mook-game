# Native integration identifiers

These values are intentionally configured for development. Replace them before App Store submission.

## Bundle

- Bundle ID: `com.scoropolis.mook`
- App name: `Mook`

## AdMob

The iOS project uses Google's official sample identifiers so development builds can never generate revenue or invalid traffic.

- Test app ID: `ca-app-pub-3940256099942544~1458002511`
- Test interstitial ID: `ca-app-pub-3940256099942544/4411468910`
- Production app ID: `[REPLACE_WITH_ADMOB_IOS_APP_ID]`
- Production interstitial ID: `[REPLACE_WITH_ADMOB_IOS_INTERSTITIAL_ID]`

Before release:

1. Replace `GADApplicationIdentifier` in `ios/App/App/Info.plist`.
2. Replace `IOS_TEST_INTERSTITIAL_ID` in `native/native.ts`.
3. Set `USE_ADMOB_TEST_CONFIGURATION` to `false` so the Google consent flow runs.
4. Keep `isTesting: true` until AdMob has approved the production app, then set it to `false` only for the signed release build.
5. Reconcile the App Privacy answers and tracking prompt with the final consent/ad-personalization configuration.

## Game Center

Create this leaderboard in App Store Connect and use its final identifier in `native/native.ts`:

- Leaderboard ID: `mook_high_score`

Game Center calls fail safely until the capability, app record, and leaderboard exist in the Apple Developer account.
