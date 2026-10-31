"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { DepthModel, type DepthModelConfig } from "@/components/three/DepthModel";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Stage = Figma frame 1920 wide, cropped to the 1120px tall content area */
const FW = 1920;
const FH = 1120;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

type Reason = {
  no: string;
  title: string;
  kicker: string;
  body: string;
  box: [number, number, number, number];
  /** where the connector meets the card, and where it leaves the head */
  to: [number, number];
  from: [number, number];
};

const REASONS: Reason[] = [
  {
    no: "01",
    title: "Strategy First",
    kicker: "We Think Before We Make.",
    body: "We Start With The Problem, Audience And Ambition Before Creating Anything.",
    box: [320, 289, 589, 173],
    to: [830, 462],
    from: [800, 545],
  },
  {
    no: "02",
    title: "Built Around Outcomes",
    kicker: "We Create For Impact.",
    body: "Every Experience Should Have A Purpose — Attention, Engagement, Conversion Or Growth.",
    box: [1010, 289, 589, 173],
    to: [1090, 462],
    from: [1120, 545],
  },
  {
    no: "03",
    title: "One Connected Team",
    kicker: "Everything Connects.",
    body: "Strategy, Creativity And Technology Under One Roof.",
    box: [320, 533, 334, 173],
    to: [654, 620],
    from: [705, 630],
  },
  {
    no: "04",
    title: "Creative + Technology",
    kicker: "We Blur The Line.",
    body: "From Cinematic Campaigns To Digital Products, We Combine Creative Thinking With Technical Execution.",
    box: [1271, 531, 334, 190],
    to: [1271, 626],
    from: [1215, 630],
  },
  {
    no: "05",
    title: "Built Around Outcomes", // TODO: design repeats card 02 — confirm final copy
    kicker: "We Create For Impact.",
    body: "Every Experience Should Have A Purpose — Attention, Engagement, Conversion Or Growth.",
    box: [320, 777, 415, 173],
    to: [735, 863],
    from: [820, 800],
  },
  {
    no: "06",
    title: "Built To Evolve",
    kicker: "We Build For What’s Next.",
    body: "We Create Systems, Experiences And Identities That Can Adapt As The Business Grows.",
    box: [1184, 777, 415, 173],
    to: [1184, 863],
    from: [1100, 800],
  },
];

const HEAD: DepthModelConfig = {
  src: "/images/why/head.webp",
  depthSrc: "/images/why/head-depth.png",
  alt: "Sculpted head in a glowing orange hat, streaked with neon pink and blue liquid",
  aspect: 1200 / 960,
  depthSize: [320, 400],
  strength: 0.38,
  rotY: [-0.5, 0.5],
  rotX: [0.22, -0.04],
  scale: [0.82, 1.02],
  bottomFade: 0.16,
  widen: 1.5,
  sizes: "(min-width: 1024px) 560px, 90vw",
};

const TITLE = "Why Hush Lush ?";

/* Reveal window for card i (desktop) */
const win = (i: number) => {
  const start = 0.16 + i * 0.085;
  return [start, start + 0.14] as const;
};

/* ───────────────────────── Shared card body ───────────────────────── */

function CardBody({ r, compact }: { r: Reason; compact?: boolean }) {
  return (
    <>
      <p className={cn("font-display font-medium text-primary", compact ? "text-base" : "text-[max(13px,0.95cqw)]")}>{r.no}</p>
      <h3 className={cn("mt-1 font-display font-semibold leading-tight text-text-primary", compact ? "text-2xl" : "text-[max(17px,1.4cqw)]")}>
        {r.title}
      </h3>
      <p className={cn("mt-2 uppercase tracking-wide text-text-primary/55", compact ? "text-sm" : "text-[max(11px,0.8cqw)]")}>{r.kicker}</p>
      <p className={cn("mt-3 leading-[1.08] text-text-primary/90", compact ? "text-base" : "text-[max(12px,0.86cqw)]")}>{r.body}</p>
    </>
  );
}

/* ───────────────────────── Desktop pieces ───────────────────────── */

function StageCard({ r, i, progress }: { r: Reason; i: number; progress: MotionValue<number> }) {
  const [x, y, w, h] = r.box;
  const [a, b] = win(i);
  const k = useTransform(progress, [a, b], [0, 1], { ease: (t) => 1 - Math.pow(1 - t, 3) });

  // fly from the head toward the card position
  // offsets as % of the card's own size (translate % is relative to the element)
  const dx = ((960 - (x + w / 2)) / w) * 100 * 0.6;
  const dy = ((620 - (y + h / 2)) / h) * 100 * 0.6;
  const left = X(x);
  const tx = useTransform(k, (v) => `${(1 - v) * dx}%`);
  const ty = useTransform(k, (v) => `${(1 - v) * dy}%`);
  const opacity = useTransform(k, [0, 0.35, 1], [0, 1, 1]);
  const scale = useTransform(k, [0, 1], [0.7, 1]);
  const filter = useTransform(k, (v) => `blur(${(1 - v) * 12}px)`);
  const rotateY = useTransform(k, [0, 1], [x < 900 ? 35 : -35, 0]);

  // brief glow right after it lands
  const glow = useTransform(progress, [b - 0.02, b + 0.02, b + 0.12], [0, 1, 0]);
  const boxShadow = useTransform(glow, (g) => `0 0 ${60 * g}px rgba(183,43,202,${0.55 * g}), inset 0 0 0 1px rgba(233,110,216,${0.5 * g})`);

  // after all cards land: subtle depth drift
  const drift = useTransform(progress, [0.8, 1], [0, i % 2 ? -14 : -24]);

  return (
    <motion.article
      className="absolute flex [perspective:1000px]"
      style={{ left, top: Y(y), width: X(w), minHeight: Y(h), x: tx, y: ty, opacity, scale, filter, rotateY, translateY: drift, zIndex: 20 }}
    >
      <motion.div
        style={{ boxShadow }}
        className="group w-full rounded-[18px] border border-white/[0.08] bg-[#0e0a12]/90 p-[0.9cqw] backdrop-blur-md transition-colors duration-500 hover:border-grad-mid/50 hover:bg-[#150e1c]/95"
      >
        <CardBody r={r} />
      </motion.div>
    </motion.article>
  );
}

function Connector({ r, i, progress }: { r: Reason; i: number; progress: MotionValue<number> }) {
  const [a, b] = win(i);
  const draw = useTransform(progress, [a - 0.03, b - 0.02], [0, 1]);
  const dot = useTransform(progress, [b - 0.04, b], [0, 1]);
  const [x1, y1] = r.from;
  const [x2, y2] = r.to;
  const cx = (x1 + x2) / 2;
  const d = `M${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  return (
    <g>
      <motion.path d={d} stroke="url(#why-line)" strokeWidth={1.6} fill="none" strokeLinecap="round" style={{ pathLength: draw, opacity: draw }} />
      <motion.circle cx={x1} cy={y1} r={5} fill="#e96ed8" style={{ opacity: draw }} />
      <motion.circle cx={x2} cy={y2} r={5} fill="#e9e02a" style={{ opacity: dot, scale: dot }} />
      {/* pulse travelling along the line once connected */}
      <motion.circle r={3} fill="#fff" style={{ opacity: dot, offsetPath: `path("${d}")` } as unknown as CSSProperties} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
    </g>
  );
}

function DesktopStage({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const titleY = useTransform(progress, [0, 0.12], [60, 0]);
  const titleOpacity = useTransform(progress, [0, 0.1], [0, 1]);
  const titleSpacing = useTransform(progress, [0, 0.14], ["0.25em", "0em"]);
  const headY = useTransform(progress, [0, 0.2], ["25%", "0%"]);
  const headOpacity = useTransform(progress, [0, 0.12], [0, 1]);
  const glowScale = useTransform(progress, [0, 0.5, 1], [0.6, 1.1, 0.95]);
  const glowOpacity = useTransform(progress, [0.05, 0.3], [0, 1]);

  return (
    <div className="sticky top-0 h-dvh overflow-hidden">
      <div
        // sits below the fixed navbar
        className="absolute left-1/2 top-[calc(50%+42px)] -translate-x-1/2 -translate-y-1/2 [container-type:size]"
        style={{ width: `min(100vw, (100dvh - 120px) * ${FW / FH})`, aspectRatio: `${FW} / ${FH}` } as CSSProperties}
      >
        {/* Title */}
        <motion.h2
          id="why-title"
          style={{ y: titleY, opacity: reduce ? 1 : titleOpacity, letterSpacing: reduce ? "0em" : titleSpacing, top: Y(35) }}
          className="absolute inset-x-0 text-center font-display text-[4.2cqw] font-semibold leading-none"
        >
          {TITLE}
        </motion.h2>

        {/* Neon glow behind the head */}
        <motion.div
          aria-hidden
          style={{ scale: glowScale, opacity: glowOpacity, left: X(560), top: Y(420), width: X(800), height: Y(700) }}
          className="absolute rounded-full bg-[radial-gradient(closest-side,rgba(233,110,216,0.35),rgba(98,34,157,0.25)_55%,transparent)] blur-2xl"
        />

        {/* 3D head */}
        <motion.div style={{ y: headY, opacity: reduce ? 1 : headOpacity, left: X(690), top: Y(450), width: X(540) }} className="absolute z-10">
          <DepthModel progress={progress} config={HEAD} />
        </motion.div>

        {/* Connectors */}
        <svg aria-hidden viewBox={`0 0 ${FW} ${FH}`} className="pointer-events-none absolute inset-0 z-[15] size-full overflow-visible">
          <defs>
            <linearGradient id="why-line" x1="0" x2="1">
              <stop stopColor="#e96ed8" />
              <stop offset="0.5" stopColor="#b72bca" />
              <stop offset="1" stopColor="#e9e02a" />
            </linearGradient>
          </defs>
          {REASONS.map((r, i) => (
            <Connector key={r.no} r={r} i={i} progress={progress} />
          ))}
        </svg>

        {REASONS.map((r, i) => (
          <StageCard key={r.no} r={r} i={i} progress={progress} />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Mobile / tablet ───────────────────────── */

const cardIn: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

function MobileWhy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <div className="container-site py-24">
      <motion.h2
        id="why-title"
        initial={{ opacity: 0, y: 40, letterSpacing: "0.2em" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "0em" }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="text-center font-display text-5xl font-semibold sm:text-6xl"
      >
        {TITLE}
      </motion.h2>
      <div ref={ref} className="relative mx-auto mt-10 w-[min(80vw,420px)]">
        <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(233,110,216,0.35),transparent)] blur-2xl" />
        <DepthModel progress={scrollYProgress} config={HEAD} />
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {REASONS.map((r) => (
          <motion.article key={r.no} variants={cardIn} className="rounded-[18px] border border-white/[0.08] bg-[#0e0a12] p-5">
            <CardBody r={r} compact />
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();

  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useMotionValue(reduce ? 1 : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce) progress.set(v);
  });
  useEffect(() => {
    progress.set(reduce ? 1 : scrollYProgress.get());
  }, [reduce, progress, scrollYProgress]);

  return (
    <section ref={sectionRef} id="why-us" aria-labelledby="why-title" className="relative lg:h-[320vh]">
      {desktop ? <DesktopStage progress={progress} reduce={reduce} /> : <MobileWhy />}
    </section>
  );
}
