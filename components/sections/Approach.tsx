import styles from "./Approach.module.css";

function TapIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.6" />
      <circle cx="24" cy="24" r="4.5" fill="currentColor" />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="6" y="30" width="10" height="12" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="19" y="21" width="10" height="21" rx="3" fill="currentColor" opacity="0.65" />
      <rect x="32" y="12" width="10" height="30" rx="3" fill="currentColor" />
      <path d="M37 3.5l1.6 3.4 3.7.4-2.8 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.8-2.5 3.7-.4z" fill="#FDD30D" />
    </svg>
  );
}

function CareIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        d="M24 41s-15-8.6-15-20.2C9 15 13.2 11 18.2 11c2.7 0 4.6 1.2 5.8 3 1.2-1.8 3.1-3 5.8-3C34.8 11 39 15 39 20.8 39 32.4 24 41 24 41z"
        fill="currentColor"
      />
      <path d="M37.5 5l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" fill="#FDD30D" />
    </svg>
  );
}

const principles = [
  {
    title: "Easy to pick up",
    text: "Intuitive experiences with clear interactions. You know what to do within seconds of opening the game.",
    icon: <TapIcon />,
    color: "var(--sky)",
  },
  {
    title: "Satisfying to master",
    text: "Thoughtful mechanics and rewarding progress, so there is always a smarter move to discover.",
    icon: <StepsIcon />,
    color: "var(--mint)",
  },
  {
    title: "Made with care",
    text: "Attention to visual polish, usability and performance, down to the last tap and sparkle.",
    icon: <CareIcon />,
    color: "var(--coral)",
  },
];

export function Approach() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="approach-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="approach-title" className="section-title">
            Made to make you smile.
          </h2>
        </header>

        <ul className={styles.grid}>
          {principles.map((item) => (
            <li
              key={item.title}
              className={styles.item}
              style={{ "--accent": item.color } as React.CSSProperties}
            >
              <span className={styles.icon}>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
