import type { Metadata } from "next";
import Image from "next/image";
import { games } from "@/site.config";
import styles from "./ads.module.css";

export const metadata: Metadata = {
  title: "Playable ads",
  description: "Previews and ad-network files for the LumaLoop playable ads.",
  robots: { index: false, follow: false },
};

// Built by `npm run ads:build` into public/ads/<game>/.
const files = [
  { suffix: "mraid.html", network: "AppLovin, Unity Ads, Mintegral, Liftoff" },
  { suffix: "ironsource.html", network: "ironSource / Unity LevelPlay" },
  { suffix: "meta.html", network: "Meta (Facebook) and Audience Network" },
  { suffix: "google.zip", network: "Google Ads and AdMob" },
];

/** Not linked from the site: a working page for previewing and downloading the playable ads. */
export default function AdsPage() {
  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Playable ads</h1>
      <p className={styles.intro}>
        Open a preview to play the ad in your browser. Each download is the file to upload to that ad network.
      </p>

      <div className={styles.list}>
        {games.map((game) => (
          <section key={game.slug} className={styles.game} aria-labelledby={`${game.slug}-ads`}>
            <div className={styles.head}>
              <Image src={game.icon} alt="" width={720} height={720} sizes="64px" className={styles.icon} />
              <h2 id={`${game.slug}-ads`}>{game.name}</h2>
              <a className="btn btn--sm" href={`/ads/${game.slug}`} target="_blank" rel="noopener noreferrer">
                Play preview
              </a>
            </div>
            <ul className={styles.files}>
              {files.map((file) => {
                const name = `${game.slug}-${file.suffix}`;
                return (
                  <li key={file.suffix}>
                    <span>{file.network}</span>
                    <a href={`/ads/${game.slug}/${name}`} download>
                      {name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
