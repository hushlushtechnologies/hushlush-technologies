"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import {
  DepthModel,
  type DepthModelConfig,
} from "@/components/three/DepthModel";
import CountUp from "@/components/ui/CountUp";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Edit the campaign here */
const OFFER = {
  month: "August",
  service: "Creative Solution",
  discount: 30,
  note: "Limited Availability · August 2026",
  serviceHref: "/services/creative-solution",
  claimHref: "/contact?offer=august-creative",
};

/* ───────────────────────── Lightning inside the bulb ───────────────────────── */

/** Jagged bolt between two points (midpoint displacement), in image units (736×736) */
function bolt(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  spread: number,
  depth = 6,
): string {
  let pts: [number, number][] = [
    [x1, y1],
    [x2, y2],
  ];
  let s = spread;
  for (let d = 0; d < depth; d++) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      next.push(
        [ax, ay],
        [
          (ax + bx) / 2 + (Math.random() - 0.5) * s,
          (ay + by) / 2 + (Math.random() - 0.5) * s * 0.3,
        ],
      );
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    s /= 2;
  }
  return (
    "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")
  );
}

function makeBolts() {
  const main = bolt(515, 318, 512 + (Math.random() - 0.5) * 20, 545, 70);
  const branches = Array.from({ length: 3 }, () => {
    const sy = 360 + Math.random() * 120;
    const dir = Math.random() > 0.5 ? 1 : -1;
    return bolt(
      515,
      sy,
      515 + dir * (30 + Math.random() * 45),
      sy + 40 + Math.random() * 50,
      30,
      4,
    );
  });
  return [main, ...branches];
}

function Lightning({
  active,
  fast = false,
  onSurge,
}: {
  active: boolean;
  fast?: boolean;
  onSurge: (on: boolean) => void;
}) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(setTimeout(() => alive && fn(), ms));

    const burst = () => {
      onSurge(true);
      const flashes = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < flashes; i++)
        later(() => setPaths(makeBolts()), i * 70);
      later(
        () => {
          setPaths([]);
          onSurge(false);
        },
        flashes * 70 + 60,
      );
      later(
        burst,
        fast ? 120 + Math.random() * 200 : 1800 + Math.random() * 2200,
      ); // next surge (rapid while charging)
    };
    later(burst, fast ? 50 : 900);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [active, fast, onSurge]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 736 736"
      className="pointer-events-none absolute inset-0 size-full mix-blend-screen"
    >
      <defs>
        <filter id="bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        filter="url(#bolt-glow)"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={i === 0 ? "#fff" : "#f0b8ff"}
            strokeWidth={i === 0 ? 2.4 : 1.4}
            strokeOpacity={i === 0 ? 1 : 0.8}
          />
        ))}
      </g>
    </svg>
  );
}

/* ───────────────────────── Brain bulb visual ───────────────────────── */

/** Centre of the brain in the 736×736 image */
const ORIGIN = { x: 0.69, y: 0.3 };

const BULB: DepthModelConfig = {
  src: "/images/offer/brain-bulb.webp",
  depthSrc: "/images/offer/brain-bulb-depth.png",
  alt: "Purple brain inside a glowing light bulb — creative ideas powered up",
  aspect: 1,
  depthSize: [368, 368],
  strength: 0.32,
  rotY: [-0.55, 0.35],
  rotX: [0.12, -0.08],
  scale: [0.9, 1.02],
  widen: 1.4,
  sizes: "(min-width: 1024px) 733px, 90vw",
};

function BrainBulb({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const inView = useInView(ref, { margin: "0px" });
  const [surge, setSurge] = useState(false);

  /* Scroll story (progress = section passing through the screen, 0 → 1):
     rises in from below and powers up → turns in 3D at the centre → drifts up and dims on exit */
  const y = useTransform(progress, [0, 0.4, 1], reduce ? [0, 0, 0] : [140, 0, -80]);
  const scale = useTransform(progress, [0, 0.4, 1], reduce ? [1, 1, 1] : [0.78, 1, 0.94]);
  const rotate = useTransform(progress, [0, 0.4, 1], reduce ? [0, 0, 0] : [-10, 0, 6]);
  const power = useTransform(progress, [0.08, 0.42], [0, 1]); // lights up as it arrives
  const bulbFilter = useTransform(
    power,
    (c) => `brightness(${0.55 + c * 0.5}) saturate(${0.6 + c * 0.6}) blur(${(1 - c) * 6}px) drop-shadow(0 0 ${10 + c * 34}px rgba(233,110,216,${0.15 + c * 0.4}))`,
  );
  const glowScale = useTransform(progress, [0.05, 0.45, 1], [0.5, 1.1, 0.9]);
  const glowOpacity = useTransform(progress, [0.05, 0.45, 0.9], [0, 0.95, 0.6]);
  // orbit ring sweeps round the bulb as you scroll
  const orbit = useTransform(progress, [0, 1], [-40, 220]);
  const orbitOpacity = useTransform(progress, [0.15, 0.4, 0.85, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, scale, rotate }}
      className="relative mx-auto aspect-square w-full max-w-[520px] lg:max-w-none"
    >
      {/* Glow behind the bulb — grows as it powers up */}
      <motion.div
        aria-hidden
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="absolute left-[40%] top-[2%] size-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(183,43,202,0.7),transparent)] blur-2xl"
      />

      {/* Energy orbit around the bulb */}
      <motion.div
        aria-hidden
        style={{ rotate: orbit, opacity: orbitOpacity, left: `${ORIGIN.x * 100}%`, top: `${ORIGIN.y * 100 + 6}%` }}
        className="pointer-events-none absolute z-10 size-[62%] -translate-x-1/2 -translate-y-1/2"
      >
        <span className="absolute inset-0 rounded-full border border-grad-start/30 [transform:rotateX(70deg)]" />
        <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(233,110,216,0.9)]" />
      </motion.div>

      {/* 3D bulb (relief model) — turns with scroll and the mouse */}
      <motion.div style={{ filter: bulbFilter }} className="relative size-full">
        <div className="relative size-full animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none">
          <DepthModel progress={progress} config={BULB} />
          {/* filament core */}
          <motion.div
            aria-hidden
            className="absolute left-[63%] top-[48%] size-[16%] rounded-full bg-[radial-gradient(closest-side,rgba(255,220,255,0.9),rgba(233,110,216,0.4)_45%,transparent)] mix-blend-screen blur-md"
            animate={{ opacity: surge ? [0.6, 1, 0.7, 1] : [0.25, 0.45, 0.3, 0.5, 0.25] }}
            transition={{ duration: surge ? 0.25 : 3, repeat: Infinity }}
          />
          <Lightning active={inView && !reduce} fast={false} onSurge={setSurge} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};
const line: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.1, ease: EASE } },
};

function GhostMarquee({
  reverse,
  className,
}: {
  reverse?: boolean;
  className?: string;
}) {
  const words = Array.from({ length: 8 }, () => "OFFERS");
  return (
    <div
      aria-hidden
      className={`pointer-events-none flex w-max select-none gap-12 whitespace-nowrap ${className}`}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          className={`flex gap-12 ${reverse ? "animate-[marquee-right_40s_linear_infinite]" : "animate-[marquee-left_40s_linear_infinite]"} motion-reduce:animate-none`}
        >
          {words.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Offer() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const copyRef = useRef<HTMLDivElement>(null);

  // Not pinned: everything plays as the section scrolls through the screen
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 0.45 : v));
  const glowY = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);
  const copyY = useTransform(progress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const showCopy = useInView(copyRef, { once: true, margin: "-15%" });

  return (
    <section
      ref={sectionRef}
      id="offer"
      aria-labelledby="offer-title"
      className="relative overflow-hidden py-24 lg:py-[clamp(6rem,9vw,10rem)]"
    >
      <div className="relative">
        {/* Background */}
        <motion.div
          aria-hidden
          style={{ y: glowY }}
          className="absolute inset-0 bg-[radial-gradient(55%_65%_at_25%_55%,rgba(102,34,159,0.55),transparent_70%),radial-gradient(40%_50%_at_10%_10%,rgba(60,20,100,0.4),transparent_70%)]"
        />

        <div className="container-site relative grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,733px)] lg:gap-0">
          {/* Copy */}
          <motion.div
            ref={copyRef}
            variants={stagger}
            initial="hidden"
            animate={showCopy ? "show" : "hidden"}
            style={{ y: copyY }}
            className="relative z-10 lg:-mr-40 lg:pb-10"
          >
            <motion.p
              variants={fadeUp}
              className="font-display text-xl font-bold uppercase text-primary sm:text-2xl lg:text-[28px]"
            >
              {OFFER.month} Exclusive -{" "}
              <span className="normal-case text-text-primary">
                {OFFER.service}
              </span>
            </motion.p>

            <div className="relative mt-12 lg:ml-[129px] lg:mt-[110px]">
              {/* Ghost "OFFERS" text drifting behind the headline */}
              <div
                aria-hidden
                className="absolute left-[-20%] top-[45%] w-[160%] overflow-hidden font-display text-[clamp(3.5rem,6.2vw,7.5rem)] font-bold leading-[0.95] text-black/25 [mask-image:linear-gradient(90deg,transparent,#000_25%,#000_60%,transparent)]"
              >
                <GhostMarquee />
                <GhostMarquee reverse className="opacity-50" />
              </div>

              <motion.h2
                id="offer-title"
                                className="relative font-display text-[clamp(2.75rem,5.8vw,5.25rem)] font-bold uppercase leading-[1.02]"
              >
                <span className="block overflow-hidden pb-1">
                  <motion.span variants={line} className="block">
                    Create More.
                  </motion.span>
                </span>
                <span className="block overflow-hidden pb-1">
                  <motion.span variants={line} className="block">
                    Pay Less.
                  </motion.span>
                </span>
              </motion.h2>
            </div>

            <div className="mt-12 lg:ml-16 lg:mt-[100px]">
              {/* Offer card with a travelling light border */}
              <motion.div
                variants={fadeUp}
                className="relative max-w-[436px] overflow-hidden rounded-[30px] p-px"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_70%,#e96ed8_80%,#e9e02a_85%,transparent_92%)]"
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative rounded-[29px] bg-[linear-gradient(120deg,#1d0630_0%,#2a0b45_55%,#5b25a8_100%)] px-6 py-6 lg:px-[25px]">
                  <p className="text-base leading-tight lg:text-[17px]">
                    Get{" "}
                    <span className="font-display text-2xl font-bold text-primary lg:text-[26px]">
                      <CountUp to={OFFER.discount} suffix="%" duration={1.6} />{" "}
                      Off {OFFER.service}
                    </span>
                    <br />
                    Services When You Book During Our {OFFER.month} Campaign.
                  </p>
                </div>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-5 flex items-center gap-2 font-display text-sm text-text-primary/60 lg:text-base"
              >
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                  <span className="relative size-2 rounded-full bg-primary" />
                </span>
                {OFFER.note}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center gap-4 lg:mt-[59px] lg:gap-[35px]"
              >
                <Link
                  href={OFFER.serviceHref}
                  className="group inline-flex h-[49px] items-center gap-4 rounded-full border border-white/10 bg-surface/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-colors duration-300 hover:border-grad-mid/50"
                >
                  Visit {OFFER.service}
                  <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                    <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href={OFFER.claimHref}
                  className="bg-brand-gradient group relative inline-flex h-[49px] items-center overflow-hidden rounded-full px-12 text-base font-medium shadow-[0_10px_40px_-10px_rgba(183,43,202,0.7)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)]"
                >
                  <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
                  <span className="relative">Claim Your Offer</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Visual */}
          <div className="relative z-20 lg:-mt-10">
            <BrainBulb progress={progress} />
          </div>
        </div>
      </div>
    </section>
  );
}
