import Image from "next/image";
import { games, type Game } from "@/site.config";
import { StoreButtons } from "../StoreButtons";
import styles from "./Games.module.css";

const featureColors = ["var(--coral)", "var(--mint)", "var(--sky)", "var(--plum)"];

function ParcelLoop({ game }: { game: Game }) {
  return (
    <article id={game.slug} className={`${styles.panel} ${styles.navyPanel}`} aria-labelledby={`${game.slug}-title`}>
      <div className={styles.panelCopy}>
        <h3 id={`${game.slug}-title`} className="visually-hidden">
          {game.name}
        </h3>
        <Image
          src={game.logo.src}
          alt={`${game.name} logo`}
          width={game.logo.width}
          height={game.logo.height}
          sizes="(max-width: 899px) 80vw, 420px"
          className={styles.loopLogo}
        />
        <p className={styles.description}>{game.description}</p>

        <ul className={styles.features}>
          {game.features.map((feature, i) => (
            <li key={feature.title}>
              <span className={styles.featureMark} style={{ background: featureColors[i] }} aria-hidden="true" />
              <span>
                <strong>{feature.title}</strong>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        <StoreButtons game={game} />
      </div>

      <div className={styles.loopArt}>
        <div className={styles.loopHalo} aria-hidden="true" />
        <Image
          src={game.icon}
          alt={`${game.name} app icon: colorful parcels on a round conveyor belt`}
          width={720}
          height={720}
          sizes="(max-width: 899px) 70vw, 420px"
          className={styles.loopIcon}
        />
      </div>

      <div className={styles.hazard} aria-hidden="true" />
    </article>
  );
}

const modeImages: Record<string, string> = {
  "Level Mode": "/images/br-levelMode.png",
  "Endless Mode": "/images/br-endlessMode.png",
  "Rush Mode": "/images/br-rushMode.png",
  "Sudoku Mode": "/images/br-sudokuMode.png",
};

function BlockReactor({ game }: { game: Game }) {
  return (
    <article id={game.slug} className={`${styles.panel} ${styles.blockPanel}`} aria-labelledby={`${game.slug}-title`}>
      <div className={styles.blockHead}>
        <Image
          src={game.logo.src}
          alt={`${game.name} logo`}
          width={game.logo.width}
          height={game.logo.height}
          sizes="(max-width: 899px) 60vw, 300px"
          className={styles.blockLogo}
        />
        <div className={styles.blockIntro}>
          <h3 id={`${game.slug}-title`} className={styles.blockTitle}>
            {game.tagline}
          </h3>
          <p className={styles.blockDescription}>{game.description}</p>
          <StoreButtons game={game} tone="light" />
        </div>
      </div>

      <ul className={styles.modes} aria-label={`${game.name} game modes`}>
        {game.features.map((mode, i) => (
          <li key={mode.title} className={styles.mode} style={{ "--accent": featureColors[i] } as React.CSSProperties}>
            <Image src={modeImages[mode.title]} alt="" width={520} height={290} sizes="(max-width: 559px) 80vw, 260px" />
            <h4>{mode.title}</h4>
            <p>{mode.text}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function NextGame() {
  return (
    <article className={styles.next} aria-labelledby="next-game-title">
      <div className={styles.mystery} aria-hidden="true">
        <span>?</span>
      </div>
      <div>
        <h3 id="next-game-title" className={styles.nextTitle}>
          Game three is on the way.
        </h3>
        <p className={styles.nextText}>
          Our third game is already in development. We are not ready to show it yet, so keep an eye on this page.
        </p>
      </div>
    </article>
  );
}

export function Games() {
  const [parcelLoop, blockReactor] = games;

  return (
    <section id="games" className={`section ${styles.section}`} aria-labelledby="games-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="games-title" className="section-title">
            Two games out.
            <br />A third on the way.
          </h2>
          <p className="lead">
            Pick-up-and-play puzzles with bright worlds and clear rules. Free to download on iPhone, iPad and
            Android.
          </p>
        </header>

        <div className={styles.list}>
          <ParcelLoop game={parcelLoop} />
          <BlockReactor game={blockReactor} />
          <NextGame />
        </div>
      </div>
    </section>
  );
}
