import Image from "next/image";
import styles from "./About.module.css";

const makes = ["Casual mobile games", "Puzzle games", "Playful interactive experiences"];

export function About() {
  return (
    <section id="about" className={`section ${styles.section}`} aria-labelledby="about-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.art}>
          <Image
            src="/images/lumaloop-logo.png"
            alt="LumaLoop Studio logo: a smiling cube with a pink orbit ring"
            width={900}
            height={735}
            sizes="(max-width: 859px) 70vw, 420px"
          />
        </div>

        <div className={styles.copy}>
          <h2 id="about-title" className="section-title">
            A small studio with a big imagination.
          </h2>
          <p className="lead">
            LumaLoop Game Studio creates playful mobile experiences built around simple ideas, thoughtful design,
            and the joy of discovery.
          </p>
          <p className={styles.body}>
            Every game starts with one small, satisfying idea, like a parcel finding its station or a line of
            blocks clearing with a pop. Then we polish it until it feels just right in your hand.
          </p>
          <ul className={styles.tags} aria-label="What we make">
            {makes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
