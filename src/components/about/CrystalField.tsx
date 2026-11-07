"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/* Frame: 1920 × 640 (bottom band of the design) */
const FW = 1920;
const FH = 640;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

const CRYSTALS = [
  // big blurred shards (depth) + sharp foreground pieces
  { src: "/images/hero/crystal-right.webp", x: 240, y: 160, w: 700, rot: -18, blur: 10, depth: 0.6, flip: false, delay: 0.05 },
  { src: "/images/hero/crystal-right.webp", x: 1040, y: 160, w: 720, rot: 14, blur: 10, depth: 0.6, flip: true, delay: 0.12 },
  { src: "/images/hero/crystal-top.webp", x: -140, y: 250, w: 620, rot: 30, blur: 0, depth: 1, flip: false, delay: 0 },
  { src: "/images/hero/crystal-top.webp", x: 1440, y: 240, w: 620, rot: -26, blur: 3, depth: 1, flip: true, delay: 0.08 },
  { src: "/images/hero/crystal-bottom.webp", x: 840, y: 420, w: 380, rot: 0, blur: 0, depth: 1.3, flip: false, delay: 0.18 },
  { src: "/images/hero/crystal-bottom.webp", x: 600, y: 480, w: 300, rot: -12, blur: 2, depth: 1.1, flip: false, delay: 0.22 },
];

const TAGS = [
  { label: "The Thinking", x: 324, y: 100, rot: -12, depth: 0.7 },
  { label: "The Making", x: 662, y: 56, rot: 12, depth: 0.5 },
  { label: "The Collaboration", x: 1148, y: 44, rot: 7, depth: 0.6 },
  { label: "The Building", x: 920, y: 270, rot: -12, depth: 0.9 },
  { label: "The Result", x: 1414, y: 168, rot: -16, depth: 0.8 },
];

function Crystal({ c, progress, i }: { c: (typeof CRYSTALS)[number]; progress: MotionValue<number>; i: number }) {
  const reduce = useReducedMotion();
  // everything settles by ~0.38 — i.e. while the whole band is on screen
  const start = c.delay * 0.5;
  const y = useTransform(progress, [start, start + 0.27, 1], reduce ? ["0%", "0%", "0%"] : ["70%", "0%", `${-12 * c.depth}%`]);
  const rotate = useTransform(progress, [start, 1], reduce ? [c.rot, c.rot] : [c.rot + (i % 2 ? 25 : -25), c.rot - (i % 2 ? 8 : -8)]);
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  return (
    <motion.div
      aria-hidden
      className="absolute aspect-square"
      style={{ left: X(c.x), top: Y(c.y), width: X(c.w), y, rotate, opacity, filter: c.blur ? `blur(${c.blur}px)` : undefined }}
    >
      <div className="relative size-full animate-[float_9s_ease-in-out_infinite] motion-reduce:animate-none" style={{ animationDelay: `${i * -1.4}s` }}>
        <Image src={c.src} alt="" fill sizes="40vw" className={`object-contain ${c.flip ? "-scale-x-100" : ""}`} />
      </div>
    </motion.div>
  );
}

function Tag({ t, i, progress }: { t: (typeof TAGS)[number]; i: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const a = 0.08 + i * 0.04;
  const k = useTransform(progress, [a, a + 0.11], [0, 1]);
  const y = useTransform(progress, [a, a + 0.11, 1], reduce ? [0, 0, 0] : [80, 0, -24 * t.depth]);
  const scale = useTransform(k, [0, 1], [0.5, 1]);
  const rotate = useTransform(k, [0, 1], [t.rot + (i % 2 ? -30 : 30), t.rot]);
  const filter = useTransform(k, (v) => `blur(${(1 - v) * 8}px)`);
  return (
    <motion.div className="absolute z-20" style={{ left: X(t.x), top: Y(t.y), y, scale, rotate, opacity: k, filter }}>
      <div className="animate-[float_6s_ease-in-out_infinite] motion-reduce:animate-none" style={{ animationDelay: `${i * -1.1}s` }}>
        <span className="inline-flex cursor-default whitespace-nowrap rounded-[14px] border border-white/10 bg-[#140c1d]/80 px-[clamp(12px,1.3vw,24px)] py-[clamp(6px,0.7vw,12px)] font-display text-[clamp(14px,1.45vw,27px)] font-medium text-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary/60 hover:shadow-[0_0_30px_-6px_rgba(233,224,42,0.6)]">
          {t.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function CrystalField() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const progress = useTransform(smooth, (v) => (reduce ? 0.6 : v));
  const glow = useTransform(progress, [0.1, 0.5], [0, 1]);

  return (
    <div ref={ref} aria-label="Our process: the thinking, the making, the collaboration, the building, the result" className="relative mt-8 w-full overflow-hidden lg:mt-12" style={{ aspectRatio: `${FW} / ${FH}`, minHeight: 360 }}>
      <motion.div aria-hidden style={{ opacity: glow }} className="absolute inset-0 bg-[radial-gradient(50%_70%_at_50%_100%,rgba(98,34,157,0.45),transparent_75%)]" />
      {CRYSTALS.map((c, i) => (
        <Crystal key={i} c={c} i={i} progress={progress} />
      ))}
      {TAGS.map((t, i) => (
        <Tag key={t.label} t={t} i={i} progress={progress} />
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
