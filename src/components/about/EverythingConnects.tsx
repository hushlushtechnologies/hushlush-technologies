"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Orbit geometry (from the Figma frame, centred on the logo) */
const BOX = 900; // square box in design px
const C = BOX / 2;
const R_OUT = 336;
const R_IN = 220;
const R_LOGO = 108;

const NODES = [
  { label: "Strategy", dx: 0, dy: -340 },
  { label: "Creative", dx: 362, dy: -112 },
  { label: "Technology", dx: 242, dy: 269 },
  { label: "Production", dx: -238, dy: 269 },
  { label: "Growth", dx: -360, dy: -112 },
];

const P = (v: number) => `${((v / BOX) * 100).toFixed(3)}%`;

/* Paragraph: words light up with scroll, highlights in yellow */
const PARAGRAPH = "Strategy Informs |Creativity.| Creativity Shapes |Experiences.| Technology Brings Them To Life. Production Makes Them Visible."
  .split("|")
  .flatMap((part, i) => part.split(" ").filter(Boolean).map((w) => ({ w, hl: i % 2 === 1 })));

function Word({ w, hl, i, n, progress }: { w: string; hl: boolean; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={hl ? "text-primary" : undefined}>
      {w}{" "}
    </motion.span>
  );
}

/* One label on the orbit — appears in turn, stays upright while the orbit turns */
function Node({ node, i, progress, counter }: { node: (typeof NODES)[number]; i: number; progress: MotionValue<number>; counter: MotionValue<number> }) {
  const k = useTransform(progress, [0.18 + i * 0.05, 0.28 + i * 0.05], [0, 1]);
  const scale = useTransform(k, [0, 1], [0.4, 1]);
  const filter = useTransform(k, (v) => `blur(${(1 - v) * 8}px)`);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: P(C + node.dx), top: P(C + node.dy) }}>
      <motion.div style={{ rotate: counter, opacity: k, scale, filter }}>
        <span className="group inline-flex cursor-default whitespace-nowrap rounded-[12px] border border-white/10 bg-[#120c1a]/90 px-[clamp(12px,1.3vw,24px)] py-[clamp(6px,0.6vw,10px)] font-display text-[clamp(15px,1.45vw,26px)] font-medium text-primary backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_-6px_rgba(233,224,42,0.6)]">
          {node.label}
        </span>
      </motion.div>
    </div>
  );
}

/* Line from the logo to a node + a pulse travelling inward */
function Link2Centre({ node, i, progress, reduce }: { node: (typeof NODES)[number]; i: number; progress: MotionValue<number>; reduce: boolean }) {
  const draw = useTransform(progress, [0.3 + i * 0.04, 0.45 + i * 0.04], [0, 1]);
  const len = Math.hypot(node.dx, node.dy);
  const ux = node.dx / len;
  const uy = node.dy / len;
  // from the logo ring edge to just short of the label
  const x1 = C + ux * (R_LOGO + 6);
  const y1 = C + uy * (R_LOGO + 6);
  const x2 = C + ux * (len - 34);
  const y2 = C + uy * (len - 34);
  const d = `M${x2} ${y2} L${x1} ${y1}`;
  return (
    <g>
      <motion.path d={d} stroke="url(#ec-line)" strokeWidth={1.4} strokeLinecap="round" style={{ pathLength: draw, opacity: draw }} />
      {!reduce && (
        <motion.circle
          r={3.5}
          fill="#fff"
          style={{ offsetPath: `path("${d}")`, opacity: draw } as unknown as CSSProperties}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 2.2, delay: i * 0.45, repeat: Infinity, ease: "easeIn" }}
        />
      )}
    </g>
  );
}

const headline: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};
const letter: Variants = {
  hidden: { y: "110%", rotate: 6 },
  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
};

export default function EverythingConnects() {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const progress = useTransform(smooth, (v) => (reduce ? 0.7 : v));

  const { scrollYProgress: textRaw } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.5"] });
  const textP = useTransform(textRaw, (v) => (reduce ? 1 : v));

  // the whole orbit turns as you scroll; labels counter-rotate to stay readable
  const rotate = useTransform(progress, [0, 1], reduce ? [0, 0] : [-50, 40]);
  const counter = useTransform(rotate, (v) => -v);
  const ringOut = useTransform(progress, [0.12, 0.38], [0, 1]);
  const ringIn = useTransform(progress, [0.18, 0.42], [0, 1]);
  const logoK = useTransform(progress, [0.2, 0.36], [0, 1]);
  const logoScale = useTransform(logoK, [0, 1], [0.3, 1]);
  const logoRotate = useTransform(logoK, [0, 1], [-120, 0]);
  const glow = useTransform(progress, [0.3, 0.55], [0, 1]);

  return (
    <section ref={ref} id="everything-connects" aria-labelledby="connects-title" className="relative overflow-hidden py-24 lg:py-[160px]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_60%,rgba(70,20,110,0.55),transparent_75%)]" />

      <div className="container-site relative">
        {/* Header row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.h2
            id="connects-title"
            aria-label="Everything Connects."
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15%" }}
            variants={headline}
            className="font-display text-[clamp(2.5rem,4.2vw,5rem)] font-bold uppercase leading-none"
          >
            {"Everything Connects.".split(" ").map((word, wi) => (
              <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                {word.split("").map((ch, ci) => (
                  <span key={ci} className="inline-block overflow-hidden pb-1 align-bottom">
                    <motion.span variants={letter} className="inline-block">
                      {ch}
                    </motion.span>
                  </span>
                ))}
                {wi === 0 && " "}
              </span>
            ))}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <Link
              href="/#services"
              className="group inline-flex h-[49px] items-center gap-8 whitespace-nowrap rounded-full border border-transparent pl-6 pr-[5px] text-base font-medium transition-shadow duration-500 [background:linear-gradient(#0f0a16,#0f0a16)_padding-box,linear-gradient(270deg,#e96ed8_0%,#b72bca_50.12%,#62229d_100%)_border-box] hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.8)]"
            >
              Explore Our Service
              <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
                <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Paragraph */}
        <p ref={textRef} className="mt-12 max-w-[900px] text-[clamp(1.375rem,1.75vw+0.4rem,2.125rem)] leading-[1.02] lg:ml-[24%] lg:mt-[110px]">
          {PARAGRAPH.map((t, i) => (
            <Word key={i} w={t.w} hl={t.hl} i={i} n={PARAGRAPH.length} progress={textP} />
          ))}
        </p>

        {/* Orbit */}
        <div className="relative mx-auto mt-16 aspect-square w-[min(100%,900px)] lg:mt-[90px]">
          <motion.div style={{ rotate }} className="absolute inset-0">
            <svg aria-hidden viewBox={`0 0 ${BOX} ${BOX}`} className="absolute inset-0 size-full overflow-visible">
              <defs>
                <linearGradient id="ec-line" x1="0" x2="1">
                  <stop stopColor="#e96ed8" />
                  <stop offset="0.5" stopColor="#b72bca" />
                  <stop offset="1" stopColor="#62229d" />
                </linearGradient>
                <linearGradient id="ec-ring" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="#62229d" />
                  <stop offset="0.5" stopColor="#b72bca" />
                  <stop offset="1" stopColor="#e96ed8" />
                </linearGradient>
              </defs>
              <motion.circle cx={C} cy={C} r={R_OUT} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} style={{ pathLength: ringOut }} transform={`rotate(-90 ${C} ${C})`} />
              <motion.circle cx={C} cy={C} r={R_IN} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.2} style={{ pathLength: ringIn }} transform={`rotate(90 ${C} ${C})`} />
              {/* small orbiting satellites on the rings */}
              {!reduce && (
                <>
                  <g className="origin-center animate-[spin_16s_linear_infinite]" style={{ transformOrigin: `${C}px ${C}px`, transformBox: "view-box" }}>
                    <circle cx={C + R_OUT} cy={C} r={4} fill="#e96ed8" />
                  </g>
                  <g className="origin-center animate-[spin_11s_linear_infinite_reverse]" style={{ transformOrigin: `${C}px ${C}px`, transformBox: "view-box" }}>
                    <circle cx={C - R_IN} cy={C} r={3} fill="#e9e02a" />
                  </g>
                </>
              )}
              {NODES.map((n, i) => (
                <Link2Centre key={n.label} node={n} i={i} progress={progress} reduce={reduce} />
              ))}
            </svg>

            {NODES.map((n, i) => (
              <Node key={n.label} node={n} i={i} progress={progress} counter={counter} />
            ))}
          </motion.div>

          {/* Centre logo (does not rotate with the orbit) */}
          <div className="absolute left-1/2 top-1/2 size-[24%] -translate-x-1/2 -translate-y-1/2">
            <motion.div aria-hidden style={{ opacity: glow }} className="absolute -inset-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(183,43,202,0.45),transparent)] blur-xl" />
            <motion.div style={{ scale: logoScale, rotate: logoRotate, opacity: logoK }} className="relative size-full">
              {/* gradient ring, slowly spinning */}
              <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full p-[3px] [background:conic-gradient(from_0deg,#62229d,#b72bca,#e96ed8,#62229d)] motion-reduce:animate-none">
                <div className="size-full rounded-full bg-[#140c1f]" />
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <Image src="/images/logo-mark.svg" alt="Hush Lush" width={43} height={40} className="h-auto w-[56%] drop-shadow-[0_0_20px_rgba(233,224,42,0.35)]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
