import Link from "next/link";
import { navLinks, siteConfig } from "@/site.config";
import { Wordmark } from "./Wordmark";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Wordmark tone="light" />
          <p>
            An independent studio making colorful mobile games built around simple ideas, thoughtful design,
            and the joy of discovery.
          </p>
        </div>

        <nav aria-label="Footer" className={styles.col}>
          <h2 className={styles.heading}>Studio</h2>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.heading}>Legal</h2>
          <ul>
            <li>
              <Link href={siteConfig.privacyPolicyPath}>Privacy Policy</Link>
            </li>
          </ul>
          {siteConfig.socials.length > 0 && (
            <>
              <h2 className={`${styles.heading} ${styles.spaced}`}>Follow</h2>
              <ul>
                {siteConfig.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} rel="me noopener noreferrer" target="_blank">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <p className={styles.made}>
          Made with care, one loop at a time <span aria-hidden="true">●</span>
        </p>
      </div>
    </footer>
  );
}
