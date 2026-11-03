/**
 * Everything that must be replaced with real values before launch lives here.
 * Leave a value as null and the site hides the link or shows a clear placeholder,
 * so no fake email address, store page or social profile is ever published.
 */

export type SocialLink = { label: string; href: string };

export const siteConfig = {
  name: "LumaLoop Game Studio",
  shortName: "LumaLoop",
  description:
    "LumaLoop Game Studio is an independent studio making colorful mobile games that spark curiosity, reward clever thinking, and make every moment a little more playful.",
  /** NEXT_PUBLIC_SITE_URL wins; on Vercel the project's production domain is used automatically. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  /** Studio contact address shown in the Contact section, e.g. "hello@yourdomain.com". */
  contactEmail: null as string | null,
  /** Support address printed in the Privacy Policy, e.g. "support@yourdomain.com". */
  supportEmail: null as string | null,

  /** Add real profiles here, e.g. { label: "Instagram", href: "https://instagram.com/…" }. */
  socials: [] as SocialLink[],

  privacyPolicyPath: "/privacy-policy",
};

export type Game = {
  slug: string;
  name: string;
  genre: string;
  tagline: string;
  description: string;
  features: { title: string; text: string }[];
  icon: string;
  logo: { src: string; width: number; height: number };
  /** Google Play package name; the Play button opens play.google.com/store/apps/details?id=… */
  androidPackage: string;
  /** iOS bundle ID; used to look up the App Store page when appStoreId is not set. */
  iosBundleId: string;
  /** Numeric App Store ID (the digits in apps.apple.com/app/id123…). Set it once the app is live. */
  appStoreId: string | null;
};

export const games: Game[] = [
  {
    slug: "parcel-loop",
    name: "Parcel Loop",
    genre: "Sorting puzzle",
    tagline: "Keep the parcels moving.",
    description:
      "Keep the parcels moving, sort every package, and master the loop. A colorful puzzle experience where timing, observation, and smart decisions make all the difference.",
    features: [
      {
        title: "Tap at the right moment",
        text: "Arm a diverter just in time to send each parcel to its matching station.",
      },
      {
        title: "Build combos, beat the jam",
        text: "Chain clean sorts and keep the belt flowing before it fills up.",
      },
      {
        title: "Warehouses across a city",
        text: "Work your way through warehouses on a city map, plus a daily challenge.",
      },
    ],
    icon: "/images/parcel-loop-icon.png",
    logo: { src: "/images/parcel-loop-logo.png", width: 1100, height: 550 },
    androidPackage: "com.lumaloop.parcelloop",
    iosBundleId: "com.lumaloop.parcelloop",
    appStoreId: null,
  },
  {
    slug: "block-reactor",
    name: "Block Reactor",
    genre: "Block puzzle",
    tagline: "Clear lines. Chain combos.",
    description:
      "Clear blocks, build combos and chase your next high score. Block Reactor mixes satisfying block placement with challenging levels, fast-paced runs and Sudoku-inspired puzzles.",
    features: [
      { title: "Level Mode", text: "Complete goals and clear blocks through increasingly challenging levels." },
      { title: "Endless Mode", text: "No timer. Plan carefully, keep the board clear and chase your best score." },
      { title: "Rush Mode", text: "Race the clock, make quick decisions and build combos before time runs out." },
      { title: "Sudoku Mode", text: "Block placement meets numbers and logic in a Sudoku-inspired twist." },
    ],
    icon: "/images/block-reactor-icon.png",
    logo: { src: "/images/block-reactor-logo.png", width: 900, height: 900 },
    androidPackage: "com.lumaloop.blockreactor",
    iosBundleId: "com.lumaloop.blockreactor",
    appStoreId: null,
  },
];

export function googlePlayUrl(game: Game) {
  return `https://play.google.com/store/apps/details?id=${game.androidPackage}`;
}

export function appStoreUrl(game: Game) {
  return game.appStoreId ? `https://apps.apple.com/app/id${game.appStoreId}` : null;
}

export const navLinks = [
  { label: "Home", href: "/#top" },
  { label: "Our Games", href: "/#games" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];
