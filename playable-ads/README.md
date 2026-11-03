# Playable ads

Self-contained HTML5 playable ads for **Parcel Loop** and **Block Reactor**. Every file has its images
inlined, needs no network requests (except Google's required `exitapi.js`), and works in portrait and landscape.

```bash
node playable-ads/build.mjs   # writes playable-ads/dist
node playable-ads/serve.mjs   # preview at http://localhost:4400/parcel-loop/ and /block-reactor/
```

## Which file goes where

| File | Upload to |
|---|---|
| `<game>-mraid.html` | AppLovin, Unity Ads, Mintegral, Liftoff and other MRAID 2.0 networks |
| `<game>-ironsource.html` | ironSource / Unity LevelPlay (uses the injected `dapi`) |
| `<game>-meta.html` | Meta (Facebook) playable ads / Audience Network (2 MB limit) |
| `<game>-google.zip` | Google Ads App campaigns and AdMob (HTML5 zip with `ExitApi`) |
| `index.html` | Browser preview; opens the store with a plain link |

Each network's own SDK is detected at runtime, so a file only calls the CTA API that is present.
Run each file through the network's own preview/validator before launching a campaign; these builds
were tested in a desktop browser, not inside the networks' tools.

## Gameplay

Both ads play continuously: there is no game over, so a session lasts as long as the player wants.

- **Parcel Loop**: tap a station to arm its diverter, and the next parcel to pass drops in. A hand shows
  when to tap. Each level needs a few more sorts and speeds up the belt. A wrong sort only breaks the combo.
- **Block Reactor**: drag pieces onto an 8×8 board. The opening is staged so the first piece clears a row
  and the second clears a row and a column at once (COMBO ×2). After that the tray refills endlessly with
  pieces that fit, and if the board ever gets stuck its fullest rows are cleared so play carries on.

After 75 seconds (`END_CARD_AFTER` in each `game.js`) one end card appears with "Play Free" and
"Keep playing". "Keep playing" closes it and the round continues where it was. A small "Play Free" button
is visible during play as well.

## Store links

- Android opens `play.google.com/store/apps/details?id=<package>` (`com.lumaloop.parcelloop`,
  `com.lumaloop.blockreactor`).
- iOS needs the numeric App Store ID. Set `iosAppId` for each game in `build.mjs` once the apps are
  live, then rebuild. Until then iOS taps open an App Store search for the game's name.
- Most networks send the click to the store URL configured in the campaign; the in-file URL is the
  fallback.

## Editing

- `src/shared/template.html` and `src/shared/cta.js`: page shell, end card, ad-network CTA and lifecycle.
- `src/<game>/game.js`: the mini game.
- `assets/`: compressed copies of the games' own art.
- `window.__playable` exposes `step`, `state`, `tap` and `drag` for automated checks.
