"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
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

/* ───────────────────────── Brain blast particles (scroll-scrubbed) ───────────────────────── */

/** Blast origin in the 736×736 image (centre of the brain) */
const ORIGIN = { x: 0.69, y: 0.3 };
/*
 * Timeline (desktop, pinned section, p: 0 → 1)
 *   0.00 – 0.06  bulb sits centre stage, big
 *   0.06 – 0.22  charging: rapid lightning, shake, glow builds
 *   0.22 – 0.44  BLAST: flash, shockwaves, sparks
 *   0.42 – 0.62  bulb glides right into its column
 *   0.50 – 0.70  offer copy reveals on the left
 *   0.70 – 1.00  hold
 */
const CHARGE: [number, number] = [0.06, 0.22];
const BLAST: [number, number] = [0.22, 0.44];
const MOVE: [number, number] = [0.42, 0.62];
export const TEXT_IN: [number, number] = [0.5, 0.7];

type Spark = {
  a: number;
  v: number;
  size: number;
  color: string;
  wob: number;
  delay: number;
};
const SPARKS: Spark[] = (() => {
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const colors = ["#e96ed8", "#b72bca", "#f6f2fa", "#e9e02a", "#9b5cf0"];
  return Array.from({ length: 220 }, () => ({
    a: r() * Math.PI * 2,
    v: 0.25 + r() * 0.85,
    size: 1.2 + r() * 3.2,
    color: colors[Math.floor(r() * colors.length)],
    wob: (r() - 0.5) * 1.2,
    delay: r() * 0.18,
  }));
})();

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function BlastCanvas({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  const draw = (p: number) => {
    const c = ref.current;
    if (!c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const t = (p - BLAST[0]) / (BLAST[1] - BLAST[0]);
    if (t <= 0 || t >= 1.4) return;
    // canvas is 2× the bulb box, centred on it
    const ox = w * 0.25 + ORIGIN.x * w * 0.5;
    const oy = h * 0.25 + ORIGIN.y * h * 0.5;
    const R = Math.min(w, h) * 0.5;

    ctx.globalCompositeOperation = "lighter";
    const pts: [number, number, number][] = [];
    for (const s of SPARKS) {
      const lt = Math.min(1, Math.max(0, (t - s.delay) / (1 - s.delay)));
      if (lt <= 0) continue;
      const d = easeOut(lt) * R * s.v;
      const ang = s.a + s.wob * lt;
      const x = ox + Math.cos(ang) * d;
      const y = oy + Math.sin(ang) * d * 0.85;
      const alpha =
        Math.max(0, 1 - lt * 0.85) * (t > 1 ? Math.max(0, 1.4 - t) / 0.4 : 1);
      // streak
      const tail = Math.max(0, d - 26 * (1 - lt));
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = alpha * 0.55;
      ctx.lineWidth = s.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(ang) * tail, oy + Math.sin(ang) * tail * 0.85);
      ctx.lineTo(x, y);
      ctx.stroke();
      // head
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
      pts.push([x, y, alpha]);
    }
    // neural links between nearby sparks (ideas connecting)
    if (t > 0.3) {
      ctx.strokeStyle = "#c48cff";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i += 2) {
        for (let j = i + 1; j < pts.length; j += 3) {
          const dx = pts[i][0] - pts[j][0];
          const dy = pts[i][1] - pts[j][1];
          const dd = dx * dx + dy * dy;
          if (dd < 3600) {
            ctx.globalAlpha =
              Math.min(pts[i][2], pts[j][2]) * (1 - dd / 3600) * 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[i][0], pts[i][1]);
            ctx.lineTo(pts[j][0], pts[j][1]);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  useMotionValueEvent(progress, "change", draw);
  useEffect(() => {
    draw(progress.get());
    const onResize = () => draw(progress.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -inset-1/2 z-20 size-[200%]"
    />
  );
}

/* ───────────────────────── Brain bulb visual ───────────────────────── */

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

function BrainBulb({
  progress: timeline,
  desktop,
}: {
  progress: MotionValue<number>;
  desktop: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const inView = useInView(ref, { margin: "0px" });
  const [surge, setSurge] = useState(false);
  const [phase, setPhase] = useState<"idle" | "charge" | "blast">("idle");

  // Mobile: no pinning — run charge + blast while the bulb crosses the middle of the screen
  const { scrollYProgress: pass } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mobileP = useTransform(pass, [0.2, 0.62], [0, 0.5]);
  const progress = useTransform(() =>
    reduce ? 0.9 : desktop ? timeline.get() : mobileP.get(),
  );
  useMotionValueEvent(progress, "change", (v) => {
    setPhase(
      v >= CHARGE[0] && v < BLAST[0]
        ? "charge"
        : v >= BLAST[0] && v < BLAST[0] + 0.06
          ? "blast"
          : "idle",
    );
  });

  /* Desktop: starts centre stage, then glides right into its column */
  const dx = useMotionValue(0); // px from the bulb's column to the section centre
  useEffect(() => {
    const measure = () => {
      const col = ref.current?.parentElement;
      const section = ref.current?.closest("section");
      if (!col || !section) return;
      const c = col.getBoundingClientRect();
      const s = section.getBoundingClientRect();
      // centre the bulb itself (it sits right of the image's middle), not just its box
      dx.set(
        s.left +
          s.width / 2 -
          (c.left + c.width / 2) -
          (ORIGIN.x - 0.5) * c.width,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [dx, desktop]);
  const atCentre = useTransform(progress, MOVE, [1, 0], {
    ease: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  });
  const x = useTransform(() =>
    desktop && !reduce ? atCentre.get() * dx.get() : 0,
  );
  const scale = useTransform(() =>
    desktop && !reduce ? 1 + atCentre.get() * 0.2 : 1,
  );
  const y = useTransform(() => 0);

  // charge → energy builds; blast → flash, shockwave, recoil
  const charge = useTransform(progress, [CHARGE[0], BLAST[0]], [0, 1]);
  const flash = useTransform(
    progress,
    [BLAST[0] - 0.01, BLAST[0] + 0.015, BLAST[0] + 0.09],
    [0, 1, 0],
  );
  const recoil = useTransform(
    progress,
    [BLAST[0], BLAST[0] + 0.03, BLAST[0] + 0.12],
    [1, 0.9, 1],
  );
  const bulbFilter = useTransform(
    [charge, flash] as MotionValue<number>[],
    ([c, f]: number[]) =>
      `brightness(${1 + c * 0.35 + f * 1.2}) saturate(${1 + c * 0.4}) drop-shadow(0 0 ${18 + c * 30 + f * 60}px rgba(233,110,216,${0.25 + c * 0.35}))`,
  );
  const glowScale = useTransform(
    [charge, flash] as MotionValue<number>[],
    ([c, f]: number[]) => 1 + c * 0.3 + f * 0.6,
  );
  const glowOpacity = useTransform(
    [charge, flash] as MotionValue<number>[],
    ([c, f]: number[]) => 0.5 + c * 0.4 + f * 0.1,
  );
  const ring = useTransform(progress, BLAST, [0, 1]);
  const ringScale = useTransform(ring, [0, 1], [0.2, 3.2]);
  const ringOpacity = useTransform(ring, [0, 0.08, 1], [0, 0.9, 0]);
  const ring2Scale = useTransform(ring, [0.1, 1], [0.2, 2.4]);
  const ring2Opacity = useTransform(ring, [0.1, 0.2, 1], [0, 0.6, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, y, x }}
      className="relative mx-auto aspect-square w-full max-w-[520px] lg:max-w-none"
    >
      {/* Glow behind the bulb — breathes, builds while charging, flares on blast */}
      <motion.div
        aria-hidden
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="absolute left-[46%] top-[6%] size-[50%] rounded-full bg-[radial-gradient(closest-side,rgba(183,43,202,0.65),transparent)] blur-2xl"
      />

      {/* Shockwave rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{ left: `${ORIGIN.x * 100}%`, top: `${ORIGIN.y * 100}%` }}
      >
        <motion.span
          style={{ scale: ringScale, opacity: ringOpacity }}
          className="absolute -left-[110px] -top-[110px] size-[220px] rounded-full border-2 border-grad-start shadow-[0_0_40px_rgba(233,110,216,0.8),inset_0_0_40px_rgba(233,110,216,0.5)]"
        />
        <motion.span
          style={{ scale: ring2Scale, opacity: ring2Opacity }}
          className="absolute -left-[110px] -top-[110px] size-[220px] rounded-full border border-primary/80"
        />
      </div>

      {/* 3D bulb (relief model) — shakes while charging */}
      <motion.div
        style={{ filter: bulbFilter, scale: recoil }}
        className={
          phase === "charge" && !reduce
            ? "relative size-full animate-[shake_0.18s_linear_infinite]"
            : "relative size-full"
        }
      >
        <div className="relative size-full animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none">
          <DepthModel progress={progress} config={BULB} />
          {/* filament core */}
          <motion.div
            aria-hidden
            className="absolute left-[63%] top-[48%] size-[16%] rounded-full bg-[radial-gradient(closest-side,rgba(255,220,255,0.9),rgba(233,110,216,0.4)_45%,transparent)] mix-blend-screen blur-md"
            animate={{
              opacity:
                surge || phase !== "idle"
                  ? [0.6, 1, 0.7, 1]
                  : [0.25, 0.45, 0.3, 0.5, 0.25],
            }}
            transition={{
              duration: surge || phase !== "idle" ? 0.25 : 3,
              repeat: Infinity,
            }}
          />
          <Lightning
            active={inView && !reduce}
            fast={phase === "charge"}
            onSurge={setSurge}
          />
        </div>
      </motion.div>

      {/* Particle blast */}
      {!reduce && <BlastCanvas progress={progress} />}

      {/* White flash */}
      <motion.div
        aria-hidden
        style={{
          opacity: flash,
          left: `${ORIGIN.x * 100}%`,
          top: `${ORIGIN.y * 100}%`,
        }}
        className="pointer-events-none absolute z-30 size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,240,255,0.95),rgba(233,110,216,0.5)_35%,transparent_70%)] mix-blend-screen"
      />
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

  // Desktop pins the section so the blast → reveal sequence plays out calmly
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const headlineX = useTransform(
    progress,
    [TEXT_IN[0], 1],
    reduce ? [0, 0] : [-40, 20],
  );
  const glowY = useTransform(
    progress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-6%", "6%"],
  );

  // Copy: hidden while the bulb is centre stage, revealed once it moves right
  const textK = useTransform(progress, TEXT_IN, [0, 1]);
  const copyOpacity = useTransform(() => (desktop ? textK.get() : 1));
  const copyX = useTransform(() => (desktop ? (1 - textK.get()) * -60 : 0));
  const [textShown, setTextShown] = useState(false);
  useMotionValueEvent(textK, "change", (v) => desktop && setTextShown(v > 0.1));
  const copyInView = useInView(copyRef, { once: true, margin: "-15%" });
  const showCopy = desktop ? textShown || !!reduce : copyInView;

  return (
    <section
      ref={sectionRef}
      id="offer"
      aria-labelledby="offer-title"
      className="relative py-24 lg:h-[300vh] lg:py-0"
    >
      <div className="relative lg:sticky lg:top-0 lg:h-dvh lg:min-h-[760px] lg:overflow-hidden">
        {/* Background */}
        <motion.div
          aria-hidden
          style={{ y: glowY }}
          className="absolute inset-0 bg-[radial-gradient(55%_65%_at_25%_55%,rgba(102,34,159,0.55),transparent_70%),radial-gradient(40%_50%_at_10%_10%,rgba(60,20,100,0.4),transparent_70%)]"
        />

        <div className="container-site relative grid items-center gap-12 lg:h-full lg:grid-cols-[1fr_minmax(0,733px)] lg:gap-0 lg:pt-16">
          {/* Copy */}
          <motion.div
            ref={copyRef}
            variants={stagger}
            initial="hidden"
            animate={showCopy ? "show" : "hidden"}
            style={{ opacity: copyOpacity, x: copyX }}
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
                style={{ x: headlineX }}
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
            <BrainBulb progress={progress} desktop={desktop} />
          </div>
        </div>
      </div>
    </section>
  );
}
