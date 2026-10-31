"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Figma frame 1920 × 985 */
const FW = 1920;
const FH = 985;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

const LEFT_LINE = "M515 371 L515 455 Q515 513 573 513 L776 513";
const RIGHT_LINE = "M1144 513 L1345 513 Q1405 513 1405 573 L1405 710";

const PARAGRAPH = "Have A Brand To Build, A Product To Launch, Or An Experience To Create? Let's Make It Happen.".split(" ");

/* ───────────────────────── Wireframe flower (generated) ───────────────────────── */

/** Superformula-ish closed curve, returned as an SVG path centred on 0,0 */
function petal(m: number, r: number, wobble: number, phase: number) {
  const pts: string[] = [];
  const N = 180;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const rr = r * (1 + wobble * Math.cos(m * t + phase) + wobble * 0.35 * Math.sin((m + 2) * t - phase));
    pts.push(`${(Math.cos(t) * rr).toFixed(1)},${(Math.sin(t) * rr).toFixed(1)}`);
  }
  return "M" + pts.join("L") + "Z";
}

const LAYERS = [
  { m: 3, count: 26, r: 120, wobble: 0.22, speed: 40, dir: 1 },
  { m: 5, count: 22, r: 105, wobble: 0.16, speed: 55, dir: -1 },
  { m: 4, count: 18, r: 82, wobble: 0.2, speed: 32, dir: 1 },
].map((l) => ({
  ...l,
  paths: Array.from({ length: l.count }, (_, i) => petal(l.m, l.r - i * 0.9, l.wobble, (i / l.count) * 0.9)),
}));

function Flower({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const scale = useTransform(progress, [0, 0.55, 1], [0.4, 1, 1.08]);
  const rotate = useTransform(progress, [0, 1], [-90, 45]);
  const opacity = useTransform(progress, [0.05, 0.4], [0, 1]);
  return (
    <motion.svg viewBox="-170 -170 340 340" aria-hidden className="size-full overflow-visible" style={{ scale, rotate, opacity }}>
      <defs>
        <linearGradient id="flower-g" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#e96ed8" />
          <stop offset="0.5" stopColor="#b72bca" />
          <stop offset="1" stopColor="#62229d" />
        </linearGradient>
      </defs>
      {LAYERS.map((l, li) => (
        <g
          key={li}
          className={reduce ? undefined : "animate-[spin_var(--s)_linear_infinite]"}
          style={{ "--s": `${l.speed}s`, animationDirection: l.dir < 0 ? "reverse" : "normal", transformOrigin: "0 0", transformBox: "view-box" } as CSSProperties}
        >
          {l.paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="url(#flower-g)" strokeWidth={0.6} strokeOpacity={0.35 + (i / l.count) * 0.4} />
          ))}
        </g>
      ))}
    </motion.svg>
  );
}

/* ───────────────────────── Pieces ───────────────────────── */

function Word({ w, i, n, progress }: { w: string; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.55 + (i / n) * 0.3, 0.55 + ((i + 1) / n) * 0.3], [0.18, 1]);
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

/** Pill with the 1px brand-gradient border from the design */
function GradientBorderPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-[49px] w-fit items-center gap-8 rounded-full border border-transparent pl-6 pr-[5px] text-base font-medium transition-shadow duration-500 [background:linear-gradient(#0f0a16,#0f0a16)_padding-box,linear-gradient(270deg,#e96ed8_0%,#b72bca_50.12%,#62229d_100%)_border-box] hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.7)]"
    >
      {children}
      <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
        <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function StartButton() {
  return (
    <Link
      href="/contact"
      className="bg-brand-gradient group relative inline-flex h-[49px] w-fit items-center overflow-hidden rounded-full px-[34px] text-base font-medium shadow-[0_10px_40px_-12px_rgba(183,43,202,0.7)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)]"
    >
      <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
      <span className="relative">Start The Project</span>
    </Link>
  );
}

function Badge({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0.25, 0.45], [0, 1]);
  const rotate = useTransform(progress, [0.25, 0.45], [-120, 0]);
  return (
    <motion.div style={{ scale, rotate }} className="relative size-full">
      <span className="absolute inset-[12%] animate-ping rounded-full bg-primary/15 [animation-duration:2.8s] motion-reduce:hidden" />
      <Image src="/images/cta/logo-badge.png" alt="Hush Lush" fill sizes="136px" className="object-contain drop-shadow-[0_0_30px_rgba(233,224,42,0.25)]" />
    </motion.div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

/* ───────────────────────── Section ───────────────────────── */

export default function LetsBuild() {
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

  // 0 when the section enters, 1 when it is centred
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "center center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));

  const lineL = useTransform(progress, [0.35, 0.6], [0, 1]);
  const lineR = useTransform(progress, [0.45, 0.7], [0, 1]);
  const dotsL = useTransform(progress, [0.55, 0.62], [0, 1]);
  const dotsR = useTransform(progress, [0.65, 0.72], [0, 1]);
  const btnLeft = useTransform(progress, [0.55, 0.7], [0, 1]);
  const btnRight = useTransform(progress, [0.3, 0.45], [0, 1]);
  const glow = useTransform(progress, [0, 1], [0.2, 1]);
  const btnRightX = useTransform(btnRight, [0, 1], [40, 0]);
  const btnLeftY = useTransform(btnLeft, [0, 1], [30, 0]);

  // mouse parallax on the flower
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const fx = useSpring(useTransform(mx, (v) => v * 30), { stiffness: 60, damping: 16 });
  const fy = useSpring(useTransform(my, (v) => v * 30), { stiffness: 60, damping: 16 });
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const headline = (
    <motion.h2
      id="build-title"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
      className="font-display font-bold uppercase leading-[1.02]"
    >
      {["Let’s Build", "Something."].map((l) => (
        <span key={l} className="block overflow-hidden pb-1">
          <motion.span
            className="block"
            variants={{ hidden: { y: "110%", rotate: 3 }, show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } } }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );

  return (
    <section ref={sectionRef} id="lets-build" aria-labelledby="build-title" className="relative overflow-hidden">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_52%,rgba(70,20,110,0.6),transparent_75%)]"
      />

      {desktop ? (
        <div className="relative mx-auto w-full max-w-[1920px] [container-type:inline-size]" style={{ aspectRatio: `${FW} / ${FH}` }}>
          {/* Connector lines */}
          <svg aria-hidden viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 size-full">
            <defs>
              <linearGradient id="build-line" x1="1" x2="0">
                <stop stopColor="#e96ed8" />
                <stop offset="0.5012" stopColor="#b72bca" />
                <stop offset="1" stopColor="#62229d" />
              </linearGradient>
            </defs>
            <path d={LEFT_LINE} fill="none" stroke="#3a1660" strokeOpacity={0.3} />
            <path d={RIGHT_LINE} fill="none" stroke="#3a1660" strokeOpacity={0.3} />
            <motion.path d={LEFT_LINE} fill="none" stroke="url(#build-line)" strokeWidth={1.4} style={{ pathLength: lineL }} />
            <motion.path d={RIGHT_LINE} fill="none" stroke="url(#build-line)" strokeWidth={1.4} style={{ pathLength: lineR }} />
            {[
              [515, 371, dotsL],
              [776, 513, dotsL],
              [1144, 513, dotsR],
              [1405, 710, dotsR],
            ].map(([cx, cy, o], i) => (
              <motion.circle key={i} cx={cx as number} cy={cy as number} r={6} fill="#7a2bc0" style={{ opacity: o as MotionValue<number> }} />
            ))}
            {/* pulses travelling along the lines */}
            {!reduce &&
              [LEFT_LINE, RIGHT_LINE].map((d, i) => (
                <motion.circle
                  key={d}
                  r={3}
                  fill="#fff"
                  style={{ offsetPath: `path("${d}")`, opacity: i ? dotsR : dotsL } as unknown as CSSProperties}
                  animate={{ offsetDistance: i ? ["0%", "100%"] : ["0%", "100%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: "easeInOut" }}
                />
              ))}
          </svg>

          {/* Headline */}
          <div className="absolute text-[4.2cqw]" style={{ left: X(320), top: Y(215) }}>
            {headline}
          </div>

          {/* Flower + badge */}
          <motion.div className="absolute" style={{ left: X(790), top: Y(343), width: X(340), aspectRatio: "1", x: fx, y: fy }}>
            <Flower progress={progress} reduce={reduce} />
          </motion.div>
          <div className="absolute" style={{ left: X(892), top: Y(445), width: X(136), aspectRatio: "1" }}>
            <Badge progress={progress} />
          </div>

          {/* Buttons */}
          <motion.div className="absolute" style={{ left: X(1270), top: Y(342), opacity: btnRight, x: btnRightX }}>
            <GradientBorderPill href="#services">Explore Our Service</GradientBorderPill>
          </motion.div>
          <motion.div className="absolute" style={{ left: X(385), top: Y(646), opacity: btnLeft, y: btnLeftY }}>
            <StartButton />
          </motion.div>

          {/* Paragraph lights up after the right line lands */}
          <p className="absolute max-w-[37.5cqw] text-[2.35cqw] tracking-[-0.01em] leading-[1.02]" style={{ left: X(855), top: Y(722) }}>
            {PARAGRAPH.map((w, i) => (
              <Word key={i} w={w} i={i} n={PARAGRAPH.length} progress={progress} />
            ))}
          </p>
        </div>
      ) : (
        <div className="container-site relative py-24">
          <div className="text-[clamp(2.75rem,10vw,4rem)]">{headline}</div>
          <div className="relative mx-auto my-12 aspect-square w-[min(80vw,360px)]">
            <motion.div className="absolute inset-0">
              <Flower progress={progress} reduce={reduce} />
            </motion.div>
            <div className="absolute inset-[30%]">
              <Badge progress={progress} />
            </div>
          </div>
          <p className="text-[clamp(1.5rem,5.5vw,2.25rem)] leading-[1.06]">
            {PARAGRAPH.map((w, i) => (
              <Word key={i} w={w} i={i} n={PARAGRAPH.length} progress={progress} />
            ))}
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <motion.div variants={fadeUp}>
              <StartButton />
            </motion.div>
            <motion.div variants={fadeUp}>
              <GradientBorderPill href="#services">Explore Our Service</GradientBorderPill>
            </motion.div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
