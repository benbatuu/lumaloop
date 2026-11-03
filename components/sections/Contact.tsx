import { siteConfig } from "@/site.config";
import { ButtonLink } from "../Button";
import styles from "./Contact.module.css";

const audiences = [
  { title: "Players", text: "Feedback, ideas or a bug you spotted. We would love to hear it.", color: "var(--mint)" },
  { title: "Collaborators", text: "Artists, musicians and fellow developers who love playful games.", color: "var(--sky)" },
  { title: "Business", text: "Publishing, partnerships and press inquiries.", color: "var(--plum)" },
];

export function Contact() {
  const email = siteConfig.contactEmail;

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.copy}>
            <h2 id="contact-title" className="section-title">
              Let&rsquo;s make something fun.
            </h2>
            <p className="lead">
              Whether you are a player with an idea, a creator who wants to collaborate, or a business with a
              proposal, we would love to hear from you.
            </p>

            {email ? (
              <div className={styles.actions}>
                <ButtonLink href={`mailto:${email}`}>Email us</ButtonLink>
                <a className={styles.email} href={`mailto:${email}`}>
                  {email}
                </a>
              </div>
            ) : (
              <div className={styles.actions}>
                <ButtonLink href="/#games">Play our games</ButtonLink>
                {/* Placeholder: set siteConfig.contactEmail to publish the real address. */}
                <span className={styles.placeholder}>Contact email coming soon</span>
              </div>
            )}

            {siteConfig.socials.length > 0 && (
              <ul className={styles.socials}>
                {siteConfig.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} target="_blank" rel="me noopener noreferrer">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ul className={styles.audiences}>
            {audiences.map((item) => (
              <li key={item.title} style={{ "--accent": item.color } as React.CSSProperties}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
