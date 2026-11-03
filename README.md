# LumaLoop Game Studio website

Next.js (App Router, TypeScript, plain CSS) site for LumaLoop Game Studio: home page with Parcel Loop,
Block Reactor and a "game three" teaser, plus the Parcel Loop privacy policy at `/privacy-policy`.
Playable ads for both games live in [`playable-ads/`](playable-ads/README.md).

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm run ads:build  # playable ads -> playable-ads/dist
```

## Before launch

Everything to replace lives in `site.config.ts`:

- `NEXT_PUBLIC_SITE_URL`: the production domain (see `.env.example`), used for canonical and Open Graph URLs.
- `contactEmail`: shown in the Contact section. While null, a "Contact email coming soon" placeholder shows.
- `supportEmail`: printed in the privacy policy. While null, `[YOUR SUPPORT EMAIL]` is highlighted.
- `socials`: add real profiles to show them in the footer and Contact section.
- `games[].appStoreId`: numeric App Store IDs. Until set, the App Store button looks the app up by bundle ID
  when clicked and says when it is not available yet. Google Play buttons use the package names directly.

Content: the privacy policy text is copied verbatim from `loop-sort-factory/docs/privacy-policy.md`
into `content/privacy-policy.ts`. Game art comes from the two game projects.
