/**
 * Parcel Loop privacy policy, copied verbatim from loop-sort-factory/docs/privacy-policy.md.
 * Only the layout is structured here: each paragraph is a "p" block and each bullet ("•")
 * is an "li" block. {SUPPORT_EMAIL} is filled from siteConfig.supportEmail, the same
 * placeholder the game uses in lib/l10n/legal_texts.dart.
 * Edit the wording only together with the in-game copy.
 */

export type PolicyBlock = { type: "p" | "li"; text: string };
export type PolicySection = { id: string; title: string; blocks: PolicyBlock[] };

export const policyTitle = "Parcel Loop — Privacy Policy";
export const policyEffectiveDate = "November 3, 2026";

export const policyIntro: PolicyBlock[] = [
  {
    type: "p",
    text: 'Parcel Loop ("the game") is made by LumaLoop Game Studio ("we", "us"). This policy explains what information is collected when you play Parcel Loop on iPhone, iPad or Android, why, who receives it and the choices you have.',
  },
  {
    type: "p",
    text: "We built the game so that it needs no account and asks for no name, email address, phone number or other contact details.",
  },
];

export const policySections: PolicySection[] = [
  {
    id: "information-on-your-device",
    title: "1. Information kept on your device",
    blocks: [
      {
        type: "p",
        text: "Your progress, stars, coins, gems, lives, power-ups, belt themes, settings and the factory name you choose are saved on your device only. We do not receive them. Deleting the game deletes them.",
      },
    ],
  },
  {
    id: "analytics",
    title: "2. Analytics",
    blocks: [
      {
        type: "p",
        text: "We use Google Analytics for Firebase to understand how the game is played and to make it better. It receives:",
      },
      {
        type: "li",
        text: "what happens in the game, such as levels started and finished, results, stars, scores, mistakes, time played, power-ups used, coins and gems earned and spent, purchases made, ads watched, settings changed and screens opened;",
      },
      {
        type: "li",
        text: "a random app instance identifier, your device model, operating system version, app version, language, and your approximate country and region, worked out from your IP address.",
      },
      {
        type: "p",
        text: "This information is not used to identify you personally and is never sold. Google keeps analytics data for up to 14 months.",
      },
    ],
  },
  {
    id: "crash-reports",
    title: "3. Crash reports",
    blocks: [
      {
        type: "p",
        text: "If the game crashes or hits an error, Firebase Crashlytics sends a report with technical details: the error, the state of the app, your device model, operating system version and a random installation identifier. We use it only to find and fix problems.",
      },
    ],
  },
  {
    id: "advertising",
    title: "4. Advertising",
    blocks: [
      {
        type: "p",
        text: "The game is free and shows ads through Google AdMob. To show, limit and measure ads, AdMob may collect your device's advertising identifier (IDFA on iOS, Advertising ID on Android), your IP address and approximate location, and information about the ads you see and tap.",
      },
      {
        type: "li",
        text: "In the European Economic Area, the United Kingdom and Switzerland, and where other laws require it, you are asked for consent before personalised ads are shown. You can change your choice at any time in the game under Settings > Privacy choices.",
      },
      {
        type: "li",
        text: "On iPhone and iPad, the advertising identifier is only used for tracking if you allow it when the game asks. You can change this at any time in your device's Settings > Privacy & Security > Tracking.",
      },
      {
        type: "li",
        text: "On Android, you can reset or delete your Advertising ID in your device's settings.",
      },
      {
        type: "p",
        text: 'Rewarded ads are always optional: you choose to watch one in exchange for a reward. Buying "No Ads" removes the ads shown between levels.',
      },
      {
        type: "p",
        text: "With your tracking permission, the game also uses what happens in it, such as your coins and recent results, on your device to decide when to offer extras like double coins. This information does not leave your device.",
      },
    ],
  },
  {
    id: "push-notifications",
    title: "5. Push notifications",
    blocks: [
      {
        type: "p",
        text: "If you allow notifications, Firebase Cloud Messaging gives your device a token so that we can send you news and reminders about the game. You can turn notifications off at any time in your device's settings.",
      },
    ],
  },
  {
    id: "leaderboards",
    title: "6. Leaderboards",
    blocks: [
      {
        type: "p",
        text: "If you are signed in to Apple Game Center or Google Play Games, your score (the number of parcels you have shipped) is sent to Apple or Google together with your player profile, and shown to other players on the leaderboard. Your player name and profile are managed by Apple or Google under their own privacy policies.",
      },
    ],
  },
  {
    id: "purchases",
    title: "7. Purchases",
    blocks: [
      {
        type: "p",
        text: "In-app purchases are processed by the Apple App Store or Google Play. We never receive your payment details. We receive only a confirmation of what was bought, so the game can deliver it and restore it.",
      },
    ],
  },
  {
    id: "legal-bases",
    title: "8. Why we use information (legal bases)",
    blocks: [
      {
        type: "p",
        text: "Where the EU or UK General Data Protection Regulation applies, we rely on:",
      },
      {
        type: "li",
        text: "performance of our agreement with you, to run the game, deliver purchases and show leaderboards;",
      },
      {
        type: "li",
        text: "our legitimate interests, to understand how the game is played, keep it working and fix crashes;",
      },
      {
        type: "li",
        text: "your consent, for personalised advertising, tracking and push notifications. You can withdraw consent at any time as described above.",
      },
    ],
  },
  {
    id: "who-receives-information",
    title: "9. Who receives information",
    blocks: [
      {
        type: "p",
        text: "Information is processed by the service providers named above, acting for us or as independent controllers:",
      },
      {
        type: "li",
        text: "Google LLC (Firebase Analytics, Firebase Crashlytics, Firebase Cloud Messaging, AdMob, Google Play Games): https://policies.google.com/privacy",
      },
      {
        type: "li",
        text: "Apple Inc. (App Store, Game Center): https://www.apple.com/legal/privacy/",
      },
      {
        type: "p",
        text: "These providers may process information in the United States and other countries, under safeguards such as the EU Standard Contractual Clauses. We do not sell your personal information and we do not share it for any other purpose.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "10. Your rights",
    blocks: [
      {
        type: "p",
        text: 'Depending on where you live (for example under the GDPR, UK GDPR, the California Consumer Privacy Act or the Brazilian LGPD), you may have the right to access, correct or delete personal information, to object to or restrict its use, to data portability, and to withdraw consent. Residents of California may opt out of the "sharing" of personal information for targeted advertising by declining tracking or personalised ads as described in section 4.',
      },
      {
        type: "p",
        text: "Because the game has no accounts, we cannot link analytics data to you by name. To make a request, contact us and include the device you play on; we will help as far as we can identify the data. You also have the right to complain to your local data protection authority.",
      },
    ],
  },
  {
    id: "children",
    title: "11. Children",
    blocks: [
      {
        type: "p",
        text: "Parcel Loop is a general-audience game and is not directed at children under 13 (or the minimum age in your country). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.",
      },
    ],
  },
  {
    id: "security-and-retention",
    title: "12. Security and retention",
    blocks: [
      {
        type: "p",
        text: "Information sent by the game travels encrypted. Analytics data is kept for up to 14 months and crash reports for up to 90 days, after which they are deleted by Google. Information on your device stays until you delete the game.",
      },
    ],
  },
  {
    id: "changes",
    title: "13. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy when the game changes. The new version will be published in the game and on our website with a new effective date. Significant changes will be announced in the game.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    blocks: [
      { type: "p", text: "LumaLoop Game Studio" },
      { type: "p", text: "Email: {SUPPORT_EMAIL}" },
      { type: "p", text: "In the game: Settings > Contact support." },
    ],
  },
];
