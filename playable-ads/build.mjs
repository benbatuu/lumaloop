// Builds self-contained playable ads for every game and ad network.
// Usage: node playable-ads/build.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), "utf8");

// Store IDs. Set iosAppId to the digits from apps.apple.com/app/id123… once each app is live.
const GAMES = [
  {
    slug: "parcel-loop",
    title: "Parcel Loop",
    androidPackage: "com.lumaloop.parcelloop",
    iosAppId: null,
    bg: "#FB9B03",
    ctaLabel: "Play Free",
    assets: {
      logo: "pl-logo.png",
      icon: "pl-icon.png",
      parcelCoral: "pl-parcel-coral.png",
      parcelHoney: "pl-parcel-honey.png",
      parcelMint: "pl-parcel-mint.png",
    },
  },
  {
    slug: "block-reactor",
    title: "Block Reactor",
    androidPackage: "com.lumaloop.blockreactor",
    iosAppId: null,
    bg: "#FFE3C4",
    ctaLabel: "Play Free",
    assets: {
      logo: "br-logo.png",
      icon: "br-icon.png",
      bg: "br-bg.jpg",
    },
  },
];

// Head tags and size limits per network. "generic" is for previewing in a browser.
const NETWORKS = {
  generic: { head: "", limit: 5, note: "Browser preview / any network without an SDK" },
  mraid: {
    head: '<script src="mraid.js"></script>',
    limit: 5,
    note: "AppLovin, Unity Ads, Mintegral, Liftoff and other MRAID 2.0 networks",
  },
  ironsource: { head: "", limit: 5, note: "ironSource / Unity LevelPlay (DAPI)" },
  meta: { head: "", limit: 2, note: "Meta Audience Network & Facebook playable ads" },
  google: {
    head: [
      '<meta name="ad.size" content="width=320,height=480">',
      '<meta name="ad.orientation" content="portrait,landscape">',
      '<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>',
    ].join("\n"),
    limit: 5,
    zip: true,
    note: "Google Ads (App campaigns) & AdMob: upload the .zip",
  },
};

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
const dataUri = (file) =>
  `data:${MIME[extname(file)]};base64,${readFileSync(join(root, "assets", file)).toString("base64")}`;

const template = read("src/shared/template.html");
const ctaJs = read("src/shared/cta.js");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });

const report = [];
for (const game of GAMES) {
  const assets = Object.fromEntries(Object.entries(game.assets).map(([k, f]) => [k, dataUri(f)]));
  const store = {
    android: `https://play.google.com/store/apps/details?id=${game.androidPackage}`,
    ios: game.iosAppId
      ? `https://apps.apple.com/app/id${game.iosAppId}`
      : `https://apps.apple.com/us/search?term=${encodeURIComponent(game.title)}`,
  };
  const gameJs = read(`src/${game.slug}/game.js`);

  for (const [network, cfg] of Object.entries(NETWORKS)) {
    const html = template
      .replaceAll("{{TITLE}}", game.title)
      .replace("{{HEAD}}", cfg.head)
      .replace("{{BG}}", game.bg)
      .replaceAll("{{CTA_LABEL}}", game.ctaLabel)
      .replace("{{ASSETS}}", () => JSON.stringify(assets))
      .replace("{{STORE}}", () => JSON.stringify(store))
      .replace("{{NETWORK}}", network)
      .replace("{{CTA_JS}}", () => ctaJs)
      .replace("{{GAME_JS}}", () => gameJs);

    const outDir = join(dist, game.slug);
    mkdirSync(outDir, { recursive: true });

    let file;
    if (cfg.zip) {
      const stage = join(dist, ".stage", game.slug);
      mkdirSync(stage, { recursive: true });
      writeFileSync(join(stage, "index.html"), html);
      file = join(outDir, `${game.slug}-${network}.zip`);
      execFileSync("zip", ["-q", "-j", "-X", file, join(stage, "index.html")]);
    } else {
      file = join(outDir, network === "generic" ? "index.html" : `${game.slug}-${network}.html`);
      writeFileSync(file, html);
    }
    const mb = statSync(file).size / 1024 / 1024;
    report.push({ game: game.slug, network, file: file.replace(root + "/", ""), mb, ok: mb <= cfg.limit, limit: cfg.limit });
  }
  if (!game.iosAppId) console.warn(`! ${game.title}: no iosAppId set, iOS fallback opens App Store search.`);
}
rmSync(join(dist, ".stage"), { recursive: true, force: true });

for (const r of report)
  console.log(`${r.ok ? "✓" : "✗"} ${r.file.padEnd(52)} ${r.mb.toFixed(2)} MB (limit ${r.limit} MB)`);
if (report.some((r) => !r.ok)) process.exit(1);
