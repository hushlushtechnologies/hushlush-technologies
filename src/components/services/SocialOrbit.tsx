"use client";

import Image from "next/image";
import { motion, useReducedMotion, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Simple platform glyphs (white on brand colour) */
const G = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r="0.6" fill="#fff" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="#fff">
      <path d="M6.5 9.5h-3V20h3V9.5ZM5 4.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM20.5 14c0-3-1.6-4.7-4-4.7-1.4 0-2.4.7-2.9 1.5V9.5h-3V20h3v-5.4c0-1.5.6-2.6 2-2.6s1.9 1 1.9 2.6V20h3v-6Z" />
    </svg>
  ),
  snapchat: (
    <svg viewBox="0 0 24 24" fill="#fff" stroke="#111" strokeWidth={1.2}>
      <path d="M12 3.5c3 0 5 2.2 5 5.2v2.1c.6.3 1.4.2 1.9 0 .4.6-.1 1.2-1.6 1.7.4 1.7 1.9 3.2 3.7 3.6-.3.7-1.4 1-2.6 1.1-.2.6-.2 1.1-.6 1.2-.8.1-1.8-.4-3 .2-.8.4-1.6 1.4-2.8 1.4s-2-1-2.8-1.4c-1.2-.6-2.2-.1-3-.2-.4-.1-.4-.6-.6-1.2-1.2-.1-2.3-.4-2.6-1.1 1.8-.4 3.3-1.9 3.7-3.6-1.5-.5-2-1.1-1.6-1.7.5.2 1.3.3 1.9 0V8.7c0-3 2-5.2 5-5.2Z" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="#fff">
      <path d="M12.3 3C7.6 3 5 6.2 5 9.6c0 1.6.9 3.5 2.2 4.1.2.1.3 0 .4-.2l.3-1.3c0-.1 0-.3-.1-.4-.5-.6-.8-1.5-.8-2.4 0-2.4 1.8-4.6 4.8-4.6 2.6 0 4.5 1.8 4.5 4.4 0 2.9-1.5 5-3.4 5-1.1 0-1.9-.9-1.6-2l.8-2.9c.2-.9-.1-1.7-1-1.7-1.1 0-1.9 1.1-1.9 2.6 0 .9.3 1.6.3 1.6l-1.2 5.3c-.4 1.6 0 4 .1 4.3 0 .1.2.2.3.1.1-.2 1.4-2.1 1.8-3.5l.7-2.6c.4.7 1.4 1.3 2.5 1.3 3.3 0 5.6-3 5.6-6.8C19.7 6 16.6 3 12.3 3Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="#fff">
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="#ff0000" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}>
      <path d="M4.5 19.5 5.6 16A7.6 7.6 0 1 1 8.3 18.6l-3.8.9Z" />
      <path d="M9.4 8.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c.5.9 1.3 1.7 2.3 2.2l.5-.5c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.3-1.6.4-3-.3a8 8 0 0 1-3.5-3.5c-.6-1.3-.4-2.2 0-2.7Z" fill="#fff" stroke="none" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="#fff">
      <path d="M20.2 4.6 3.8 10.9c-1 .4-1 1 0 1.3l4 1.3 1.6 4.8c.2.5.5.6.9.2l2.3-2.1 4.2 3.1c.6.4 1.1.2 1.2-.6l2.7-12.9c.2-1-.4-1.5-1.3-1.1Zm-3.4 3.6-7 6.3-.3 2.8-1-3.4 8.3-5.7Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="#fff">
      <path d="M13.5 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3h1.3V5.6c-.3 0-1-.1-2-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.7v2.6h2.2V20h2.6Z" />
    </svg>
  ),
};

type Item = { key: keyof typeof G; label: string; angle: number; bg: string };

const ITEMS: Item[] = [
  { key: "instagram", label: "Instagram", angle: -90, bg: "linear-gradient(45deg,#feda75,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5)" },
  { key: "linkedin", label: "LinkedIn", angle: -36, bg: "#0a66c2" },
  { key: "snapchat", label: "Snapchat", angle: 0, bg: "#fffc00" },
  { key: "pinterest", label: "Pinterest", angle: 36, bg: "#e60023" },
  { key: "youtube", label: "YouTube", angle: 90, bg: "#ff0000" },
  { key: "whatsapp", label: "WhatsApp", angle: 144, bg: "#25d366" },
  { key: "telegram", label: "Telegram", angle: 180, bg: "#27a7e7" },
  { key: "facebook", label: "Facebook", angle: 216, bg: "#1877f2" },
];

/* Box is 48cqw square; radii as % of the box */
const R_OUTER = 44.6;
const R_INNER = 29;

function Tile({ item, i, play, reduce }: { item: Item; i: number; play: boolean; reduce: boolean }): ReactNode {
  const rad = (item.angle * Math.PI) / 180;
  const x = Math.cos(rad) * R_OUTER;
  const y = Math.sin(rad) * R_OUTER;
  return (
    <motion.li
      aria-label={item.label}
      initial={{ left: "50%", top: "50%", opacity: 0, scale: 0.2 }}
      animate={play ? { left: `${50 + x}%`, top: `${50 + y}%`, opacity: 1, scale: 1 } : undefined}
      transition={{ duration: reduce ? 0 : 1.1, ease: EASE, delay: reduce ? 0 : 1 + i * 0.09 }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      {/* counter-rotate so icons stay upright while the orbit turns */}
      <div className="motion-safe:animate-[spin_60s_linear_infinite_reverse] group-hover/orbit:[animation-play-state:paused]">
        <motion.div
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          className="group/tile grid size-[clamp(44px,5.3cqw,68px)] place-items-center rounded-[22%] border border-white/[0.07] bg-[#0f0b14]/95 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:scale-110 hover:border-grad-start/50 hover:shadow-[0_0_30px_-4px_rgba(233,110,216,0.7)]"
        >
          <span className="grid size-[56%] place-items-center rounded-[24%] p-[10%]" style={{ background: item.bg }}>
            <span className="block size-full">{G[item.key]}</span>
          </span>
        </motion.div>
      </div>
    </motion.li>
  );
}

export default function SocialOrbit({ play, logo, rx, ry }: { play: boolean; logo: string; rx: MotionValue<number>; ry: MotionValue<number> }) {
  const reduce = !!useReducedMotion();
  return (
    <motion.div style={{ rotateX: rx, rotateY: ry }} className="group/orbit relative aspect-square w-full [transform-style:preserve-3d]">
      {/* rings */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="orbit-ring" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#e96ed8" />
            <stop offset="0.5" stopColor="#b72bca" />
            <stop offset="1" stopColor="#62229d" />
          </linearGradient>
        </defs>
        {[R_OUTER, R_INNER].map((r, i) => (
          <motion.circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={play ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: reduce ? 0 : 1.6, ease: EASE, delay: reduce ? 0 : 0.4 + i * 0.2 }}
            style={{ rotate: -90, transformOrigin: "50% 50%" }}
          />
        ))}
        {/* signal pulses travelling round the outer ring */}
        {!reduce && (
          <circle r="0.6" fill="#e96ed8" className="drop-shadow-[0_0_2px_#e96ed8]">
            <animateMotion dur="9s" repeatCount="indefinite" path={`M50 ${50 - R_OUTER} a${R_OUTER} ${R_OUTER} 0 1 1 -0.01 0`} />
          </circle>
        )}
        {!reduce && (
          <circle r="0.45" fill="#fff">
            <animateMotion dur="6s" repeatCount="indefinite" path={`M50 ${50 + R_INNER} a${R_INNER} ${R_INNER} 0 1 1 0.01 0`} />
          </circle>
        )}
      </svg>

      {/* expanding sonar rings from the centre */}
      {!reduce &&
        [0, 1].map((k) => (
          <span
            key={k}
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[28.8%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-grad-mid/40 motion-safe:animate-[ping_3.6s_cubic-bezier(0,0,0.2,1)_infinite]"
            style={{ animationDelay: `${k * 1.8 + 2}s` }}
          />
        ))}

      {/* centre: gold mark in a gradient ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, filter: "blur(12px)" }}
        animate={play ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: reduce ? 0 : 0.3 }}
        className="absolute left-1/2 top-1/2 z-10 size-[28.8%] -translate-x-1/2 -translate-y-1/2 rounded-full p-[2px] shadow-[0_0_60px_-10px_rgba(183,43,202,0.8)] [background:linear-gradient(135deg,#E96ED8,#B72BCA_50%,#62229D)]"
      >
        <div className="grid size-full place-items-center rounded-full bg-[#060508]">
          <motion.div
            animate={reduce ? undefined : { rotate: [0, -4, 0, 4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[58%]"
          >
            <Image src={logo} alt="Hush Lush Technologies" width={400} height={389} priority className="h-auto w-full drop-shadow-[0_6px_14px_rgba(233,190,60,0.35)]" />
          </motion.div>
        </div>
      </motion.div>

      {/* platform tiles orbiting slowly */}
      <ul aria-label="Platforms we market on" className="absolute inset-0 motion-safe:animate-[spin_60s_linear_infinite] group-hover/orbit:[animation-play-state:paused]">
        {ITEMS.map((it, i) => (
          <Tile key={it.key} item={it} i={i} play={play} reduce={reduce} />
        ))}
      </ul>
    </motion.div>
  );
}
