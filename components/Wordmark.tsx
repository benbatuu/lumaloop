import Image from "next/image";
import Link from "next/link";
import styles from "./Wordmark.module.css";

/** The studio mascot: the smiling cube with its orbit, cropped from the LumaLoop Studio logo. */
export function LoopMark({ size = 46, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/lumaloop-mark.png"
      alt=""
      width={size}
      height={Math.round((size * 259) / 360)}
      className={className}
      priority
    />
  );
}

export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link
      href="/#top"
      className={`${styles.wordmark} ${tone === "light" ? styles.light : ""}`}
      aria-label="LumaLoop Game Studio, home"
    >
      <LoopMark className={styles.mark} />
      <span className={styles.text}>
        <span className={styles.name}>
          Luma<span className={styles.loop}>Loop</span>
        </span>
        <span className={styles.sub}>Game Studio</span>
      </span>
    </Link>
  );
}
