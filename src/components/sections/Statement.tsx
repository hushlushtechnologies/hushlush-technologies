"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ["We", "Are", "More", "Than", "An", "Agency."];

/** Elongated 4-point star from the Figma design */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="-97 -112 194 224" aria-hidden className={className} fill="currentColor">
      <path d="M0 -112 L16 -16 L97 0 L16 16 L0 112 L-16 16 L-97 0 L-16 -16 Z" />
    </svg>
  );
}

const headingClass =
  "relative font-display text-[clamp(2.25rem,3.95vw,4.75rem)] font-bold uppercase leading-[1.06] text-text-primary";

/* ───────── Pinned mode: scrubbed by the hero's scroll progress (desktop) ───────── */

function ScrubWord({ word, index, progress }: { word: string; index: number; progress: MotionValue<number> }) {
  const start = 0.5 + index * 0.035;
  const end = start + 0.12;
  const y = useTransform(progress, [start, end], ["110%", "0%"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const filter = useTransform(progress, [start, end], ["blur(10px)", "blur(0px)"]);
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      <motion.span className="inline-block" style={{ y, opacity, filter }}>
        {word}
      </motion.span>
    </span>
  );
}

function PinnedStatement({ progress }: { progress: MotionValue<number> }) {
  const starScale = useTransform(progress, [0.44, 0.64], [0, 1]);
  const starRotate = useTransform(progress, [0.44, 0.64], [-120, 0]);
  const starOpacity = useTransform(progress, [0.44, 0.54], [0, 1]);

  return (
    <section
      aria-labelledby="statement-title"
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <motion.div style={{ scale: starScale, rotate: starRotate, opacity: starOpacity }} className="absolute">
        <Star className="h-[clamp(140px,11.7vw,224px)] w-auto text-primary/25" />
      </motion.div>
      <h2 id="statement-title" className={`${headingClass} container-site text-center`}>
        {WORDS.map((w, i) => (
          <span key={w}>
            <ScrubWord word={w} index={i} progress={progress} />
            {i < WORDS.length - 1 && " "}
          </span>
        ))}
      </h2>
    </section>
  );
}

/* ───────── Standalone mode: phones, tablets, reduced motion (and server HTML) ───────── */

const wordVariant: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

function StandaloneStatement() {
  return (
    <section
      aria-labelledby="statement-title"
      className="relative flex min-h-[80dvh] items-center justify-center overflow-hidden py-32"
    >
      {/* The hero crystal, resting blurred at the top */}
      <div aria-hidden className="pointer-events-none absolute left-[51%] top-[6%] aspect-square w-[min(110vw,640px)] -translate-x-1/2 -translate-y-1/2 rotate-[200deg] blur-[4px]">
        <Image src="/images/hero/crystal-bottom.webp" alt="" fill sizes="110vw" className="object-contain" />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -120, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.4, ease: EASE }}
        className="absolute"
      >
        <Star className="h-[clamp(140px,11.7vw,224px)] w-auto text-primary/25" />
      </motion.div>

      <motion.h2
        id="statement-title"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-20%" }}
        transition={{ staggerChildren: 0.08 }}
        className={`${headingClass} container-site text-center`}
      >
        {WORDS.map((w, i) => (
          <span key={w}>
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span variants={wordVariant} className="inline-block">
                {w}
              </motion.span>
            </span>
            {i < WORDS.length - 1 && " "}
          </span>
        ))}
      </motion.h2>
    </section>
  );
}

export default function Statement({ progress }: { progress?: MotionValue<number> }) {
  return progress ? <PinnedStatement progress={progress} /> : <StandaloneStatement />;
}
