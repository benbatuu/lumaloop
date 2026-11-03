"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

// A stadium-shaped belt: two straights joined by semicircles.
const BELT = "M 240 80 H 360 A 200 200 0 0 1 360 480 H 240 A 200 200 0 0 1 240 80 Z";
const LAP = 16; // seconds per lap

type Rider = { kind: "parcel"; src: string } | { kind: "block"; fill: string; shade: string };

const riders: Rider[] = [
  { kind: "parcel", src: "/images/parcel-coral.png" },
  { kind: "block", fill: "#6EC3F2", shade: "#3F96C7" },
  { kind: "parcel", src: "/images/parcel-mint.png" },
  { kind: "block", fill: "#FFD45A", shade: "#D9A92A" },
  { kind: "parcel", src: "/images/parcel-honey.png" },
  { kind: "block", fill: "#B391F2", shade: "#8466C7" },
  { kind: "parcel", src: "/images/parcel-coral.png" },
  { kind: "block", fill: "#7FD99A", shade: "#4FAE6C" },
];

/** The hero's conveyor: game pieces from both games ride a loop around the studio mascot. */
export function HeroLoop() {
  const svgRef = useRef<SVGSVGElement>(null);

  // SMIL ignores prefers-reduced-motion, so pause it by hand.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => (query.matches ? svg.pauseAnimations() : svg.unpauseAnimations());
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <svg
      ref={svgRef}
      className={styles.loop}
      viewBox="0 0 600 560"
      role="img"
      aria-label="LumaLoop Studio logo inside a conveyor loop carrying parcels from Parcel Loop and blocks from Block Reactor"
    >
      <defs>
        <path id="hero-belt" d={BELT} />
        <radialGradient id="hero-glow">
          <stop offset="0" stopColor="#FFE96B" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#FDD30D" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FDD30D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="300" cy="300" rx="250" ry="215" fill="url(#hero-glow)" />

      {/* belt: hazard edge, rails, surface, moving slats */}
      <g className={styles.belt}>
        <use href="#hero-belt" fill="none" stroke="#031241" strokeWidth="86" />
        <use href="#hero-belt" fill="none" stroke="#FDD30D" strokeWidth="80" strokeDasharray="14 14" className={styles.hazard} />
        <use href="#hero-belt" fill="none" stroke="#AEB8CC" strokeWidth="68" />
        <use href="#hero-belt" fill="none" stroke="#2B3550" strokeWidth="58" />
        <use href="#hero-belt" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="50" strokeDasharray="3 21" className={styles.slats} />
      </g>

      <image
        href="/images/lumaloop-logo.png"
        x="160"
        y="166"
        width="280"
        height="228"
        className={styles.logo}
      />

      {riders.map((rider, i) => {
        const begin = `${-(LAP / riders.length) * i}s`;
        return (
          <g key={i} className={styles.rider}>
            {rider.kind === "parcel" ? (
              <image href={rider.src} x="-38" y="-50" width="76" height="76" />
            ) : (
              <g transform="translate(-25 -32) scale(1.2)">
                <rect width="42" height="42" rx="10" fill={rider.shade} />
                <rect width="42" height="37" rx="10" fill={rider.fill} />
                <rect x="9" y="6" width="17" height="5" rx="2.5" fill="#fff" opacity="0.55" />
              </g>
            )}
            <animateMotion dur={`${LAP}s`} begin={begin} repeatCount="indefinite">
              <mpath href="#hero-belt" />
            </animateMotion>
          </g>
        );
      })}
    </svg>
  );
}
