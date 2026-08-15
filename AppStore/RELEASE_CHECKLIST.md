# App Store Release Checklist

## Apple account

- [ ] Enroll in the Apple Developer Program.
- [ ] Confirm the final seller name.
- [ ] Register bundle ID `com.scoropolis.mook`.
- [ ] Enable Game Center on the identifier and Xcode target.
- [ ] Create the Mook app record in App Store Connect.
- [ ] Create Game Center leaderboard `mook_high_score` or update `native/native.ts` to match Apple’s identifier.

## Advertising

- [ ] Create Mook in AdMob.
- [ ] Replace the sample app ID in `ios/App/App/Info.plist`.
- [ ] Replace the test interstitial ID in `native/native.ts`.
- [ ] Configure AdMob’s consent message and privacy options.
- [ ] Decide whether personalized advertising is enabled.
- [ ] Verify App Tracking Transparency behavior before requesting permission.
- [ ] Test only with Google test ads until the production account is ready.

## Store information

- [ ] Confirm name, subtitle, description, categories, keywords, and copyright.
- [ ] Publish and review the privacy and support pages.
- [ ] Complete App Privacy responses using the final AdMob SDK configuration.
- [ ] Complete age rating and export compliance.
- [ ] Upload final iPhone screenshots.

## Quality

- [ ] Test on at least one physical iPhone.
- [ ] Verify audio respects Silent Mode and the in-game mute setting.
- [ ] Verify native haptics and the haptics setting.
- [ ] Verify backgrounding clears active targets without penalties.
- [ ] Verify Game Center sign-in, score submission, and leaderboard presentation.
- [ ] Verify production ad load, close, failure fallback, and consent handling.
- [ ] Run a TestFlight beta before review.
- [ ] Archive with a Distribution profile and validate in Xcode Organizer.
