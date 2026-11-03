"use client";

import { useState } from "react";
import { appStoreUrl, googlePlayUrl, type Game } from "@/site.config";
import styles from "./StoreButtons.module.css";

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.47-.03-.01-2.3-.88-2.33-3.5zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21z"
      />
    </svg>
  );
}

function PlayLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#21C29E" d="M4.2 2.6 13.6 12l-9.4 9.4c-.35-.2-.6-.6-.6-1.1V3.7c0-.5.25-.9.6-1.1z" />
      <path fill="#FDD30D" d="m16.9 15.3-3.3-3.3 3.3-3.3 3.7 2.1c1 .6 1 1.9 0 2.5l-3.7 2z" />
      <path fill="#F06455" d="M16.9 15.3 13.6 12l-9.4 9.4c.36.2.83.22 1.26-.03l11.44-6.07z" />
      <path fill="#2185EF" d="M16.9 8.7 5.46 2.63c-.43-.25-.9-.23-1.26-.03L13.6 12l3.3-3.3z" />
    </svg>
  );
}

type LookupResult = { resultCount: number; results: { trackViewUrl?: string }[] };

/**
 * Download buttons that go straight to each store.
 * Google Play is addressed by package name. The App Store needs a numeric ID, so until
 * appStoreId is configured the button looks the app up by its bundle ID at click time.
 */
export function StoreButtons({ game, tone = "dark" }: { game: Game; tone?: "dark" | "light" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "missing">("idle");
  const directAppStore = appStoreUrl(game);

  async function openAppStore() {
    setStatus("loading");
    try {
      const response = await fetch(
        `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(game.iosBundleId)}`,
      );
      const data = (await response.json()) as LookupResult;
      const url = data.results[0]?.trackViewUrl;
      if (url) {
        window.location.assign(url);
        return;
      }
    } catch {
      // Network failure is reported the same way as a missing listing.
    }
    setStatus("missing");
  }

  const toneClass = tone === "light" ? styles.light : "";

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {directAppStore ? (
          <a
            className={`${styles.store} ${toneClass}`}
            href={directAppStore}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${game.name} on the App Store`}
          >
            <AppleLogo />
            <span className={styles.label}>
              <small>Download on the</small>App Store
            </span>
          </a>
        ) : (
          <button
            type="button"
            className={`${styles.store} ${toneClass}`}
            onClick={openAppStore}
            aria-busy={status === "loading"}
            aria-label={`Download ${game.name} on the App Store`}
          >
            <AppleLogo />
            <span className={styles.label}>
              <small>{status === "loading" ? "Opening…" : "Download on the"}</small>App Store
            </span>
          </button>
        )}

        <a
          className={`${styles.store} ${toneClass}`}
          href={googlePlayUrl(game)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get ${game.name} on Google Play`}
        >
          <PlayLogo />
          <span className={styles.label}>
            <small>Get it on</small>Google Play
          </span>
        </a>
      </div>
      <p className={styles.note} role="status">
        {status === "missing" ? `${game.name} isn't on the App Store in your region yet. Check back soon!` : ""}
      </p>
    </div>
  );
}
