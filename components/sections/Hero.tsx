import Image from "next/image";
import { ButtonLink } from "../Button";
import { HeroLoop } from "./HeroLoop";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>Small worlds.</span>
            <span className={styles.line}>Big fun.</span>
          </h1>

          <p className={`lead ${styles.lead}`}>
            We create colorful mobile games designed to spark curiosity, reward clever thinking, and make every
            moment a little more playful.
          </p>

          <div className={styles.ctas}>
            <ButtonLink href="/#games">Explore our games</ButtonLink>
            <ButtonLink href="/#about" variant="outline">
              Meet the studio
            </ButtonLink>
          </div>

          <p className={styles.now}>
            <a href="#parcel-loop" className={styles.nowIcon}>
              <Image src="/images/parcel-loop-icon.png" alt="Parcel Loop" width={720} height={720} sizes="44px" />
            </a>
            <a href="#block-reactor" className={styles.nowIcon}>
              <Image src="/images/block-reactor-icon.png" alt="Block Reactor" width={720} height={720} sizes="44px" />
            </a>
            <span>
              Parcel Loop and Block Reactor are out now.
              <br />
              Our third game is on the way.
            </span>
          </p>
        </div>

        <div className={styles.visual}>
          <HeroLoop />
        </div>
      </div>
    </section>
  );
}
