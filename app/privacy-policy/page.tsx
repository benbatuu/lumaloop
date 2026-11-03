import type { Metadata } from "next";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import {
  policyEffectiveDate,
  policyIntro,
  policySections,
  type PolicyBlock,
} from "@/content/privacy-policy";
import { siteConfig } from "@/site.config";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Parcel Loop Privacy Policy",
  description:
    "How Parcel Loop by LumaLoop Game Studio handles information: what stays on your device, analytics, crash reports, advertising and your choices.",
  alternates: { canonical: siteConfig.privacyPolicyPath },
  openGraph: { url: siteConfig.privacyPolicyPath },
};

const URL_PATTERN = /(https:\/\/[^\s]+)/g;

/** Turns policy URLs into links and fills in the configured support email, leaving the wording untouched. */
function renderText(text: string): ReactNode {
  if (text.includes("{SUPPORT_EMAIL}")) {
    const [before, after] = text.split("{SUPPORT_EMAIL}");
    const email = siteConfig.supportEmail;
    return (
      <>
        {before}
        {email ? (
          <a href={`mailto:${email}`}>{email}</a>
        ) : (
          <span className={styles.placeholder}>[YOUR SUPPORT EMAIL]</span>
        )}
        {after}
      </>
    );
  }

  return text.split(URL_PATTERN).map((part, i) =>
    part.startsWith("https://") ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Groups consecutive bullet blocks into one list. */
function renderBlocks(blocks: PolicyBlock[]) {
  const out: ReactNode[] = [];
  let bullets: PolicyBlock[] = [];

  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`ul-${out.length}`}>
          {bullets.map((b, i) => (
            <li key={i}>{renderText(b.text)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  blocks.forEach((block, i) => {
    if (block.type === "li") {
      bullets.push(block);
    } else {
      flush();
      out.push(<p key={`p-${i}`}>{renderText(block.text)}</p>);
    }
  });
  flush();
  return out;
}

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div>
            <span className="badge badge--soft">
              <span className="badge__dot" aria-hidden="true" />
              Parcel Loop
            </span>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.meta}>
              Effective date: <time dateTime="2026-11-03">{policyEffectiveDate}</time>
            </p>
          </div>
          <Image
            src="/images/parcel-loop-icon.png"
            alt="Parcel Loop app icon"
            width={720}
            height={720}
            sizes="140px"
            className={styles.icon}
            priority
          />
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.aside}>
          <details className={styles.tocMobile}>
            <summary>On this page</summary>
            <TocList />
          </details>
          <nav className={styles.toc} aria-label="Table of contents">
            <p className={styles.tocTitle}>On this page</p>
            <TocList />
          </nav>
        </aside>

        <article className={styles.article}>
          <div className={styles.intro}>{renderBlocks(policyIntro)}</div>

          {policySections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-h`}>
              <h2 id={`${section.id}-h`}>{section.title}</h2>
              {renderBlocks(section.blocks)}
            </section>
          ))}

          <aside className={styles.related} aria-label="Third-party privacy policies">
            <h2>Third-party privacy policies</h2>
            <ul>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
                  Apple Privacy Policy
                </a>
              </li>
            </ul>
          </aside>
        </article>
      </div>
    </div>
  );
}

function TocList() {
  return (
    <ol className={styles.tocList}>
      {policySections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, "")}</a>
        </li>
      ))}
    </ol>
  );
}
