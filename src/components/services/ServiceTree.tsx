"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Geometry in Figma units (1920 frame). Content column spans x 320 → 1600. */
const CX = 728; // trunk height
const TRUNK_START = 685;
const FORK = 820;
const PILL_X = { near: 1262, far: 1158 }; // pills alternate between two columns
const LINE_END = { near: 1240, far: 1135 };
const GAP = 117; // distance from trunk to the first pill row
const STEP = 58;

type Branch = { label: string; y: number; x: number; end: number; d: string };

function layout(items: string[]) {
  const above = Math.ceil((items.length + 1) / 2); // 7 → 4 up / 3 down, 8 → 5 / 3 (as in the designs)
  const branches: Branch[] = items.map((label, i) => {
    const up = i < above;
    const k = up ? above - 1 - i : i - above; // 0 = closest to the trunk
    const y = up ? CX - GAP - k * STEP : CX + GAP + 10 + k * STEP;
    const near = k % 2 === 0;
    const end = near ? LINE_END.near : LINE_END.far;
    const d = `M${FORK} ${CX} C ${FORK + 110} ${CX} ${FORK + 120} ${y} ${FORK + 230} ${y} L ${end} ${y}`;
    return { label, y, x: near ? PILL_X.near : PILL_X.far, end, d };
  });
  const top = Math.min(...branches.map((b) => b.y)) - 60;
  const bottom = Math.max(...branches.map((b) => b.y)) + 60;
  return { branches, top, height: bottom - top };
}

/* ───────────────────────── Branch ───────────────────────── */

function BranchPath({ b, i, n, p, active, reduce }: { b: Branch; i: number; n: number; p: MotionValue<number>; active: boolean; reduce: boolean }) {
  const start = 0.25 + (i / n) * 0.35;
  const len = useTransform(p, [start, start + 0.3], [0, 1]);
  return (
    <g>
      {/* glow copy */}
      <motion.path d={b.d} fill="none" stroke="url(#tree-g)" strokeWidth={active ? 6 : 3} style={{ pathLength: len }} className={cn("blur-[3px] transition-[stroke-width,opacity] duration-300", active ? "opacity-90" : "opacity-30")} />
      <motion.path id={`br-${i}`} d={b.d} fill="none" stroke="url(#tree-g)" strokeWidth={active ? 2 : 1.2} style={{ pathLength: len }} className="transition-[stroke-width] duration-300" />
      {/* energy pulse travelling out to the pill */}
      {!reduce && (
        <circle r={active ? 4 : 2.6} fill="#fff" className="drop-shadow-[0_0_6px_#e96ed8]">
          <animateMotion dur={`${2.6 + (i % 3) * 0.5}s`} begin={`${1.5 + i * 0.35}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.6 1">
            <mpath href={`#br-${i}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${2.6 + (i % 3) * 0.5}s`} begin={`${1.5 + i * 0.35}s`} repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function Pill({ b, i, n, p, top, height, onHover }: { b: Branch; i: number; n: number; p: MotionValue<number>; top: number; height: number; onHover: (v: number | null) => void }) {
  const at = 0.25 + (i / n) * 0.35 + 0.22;
  const opacity = useTransform(p, [at, at + 0.08], [0, 1]);
  const x = useTransform(p, [at, at + 0.12], [-30, 0]);
  const scale = useTransform(p, [at, at + 0.12], [0.85, 1]);
  return (
    <motion.li
      style={{ left: `${((b.x - 320) / 1280) * 100}%`, top: `${((b.y - top) / height) * 100}%`, opacity, x, scale }}
      className="absolute -translate-y-1/2"
    >
      <a
        href={`#${slugify(b.label)}`}
        onMouseEnter={() => onHover(i)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(i)}
        onBlur={() => onHover(null)}
        className="group relative inline-flex h-[3.6cqw] max-h-[47px] items-center whitespace-nowrap rounded-xl border border-white/10 bg-[#120b1a]/90 px-[1.85cqw] font-display text-[1.4cqw] font-medium text-primary transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-grad-start/60 hover:shadow-[0_0_30px_-6px_rgba(233,110,216,0.8)]"
      >
        {b.label}
      </a>
    </motion.li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function ServiceTree({ category, items }: { category: string; items: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const { branches, top, height } = layout(items);
  const n = branches.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.5"] });
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const p = useTransform(sp, (v) => (reduce ? 1 : v));

  const underline = useTransform(p, [0, 0.2], [0, 1]);
  const trunk = useTransform(p, [0.1, 0.3], [0, 1]);
  const titleO = useTransform(p, [0, 0.12], [0, 1]);
  const titleX = useTransform(p, [0, 0.15], [-40, 0]);
  const logoO = useTransform(p, [0.28, 0.4], [0, 1]);
  const logoS = useTransform(p, [0.28, 0.45], [0.6, 1]);
  const logoBlur = useTransform(p, [0.28, 0.45], ["blur(10px)", "blur(0px)"]);

  const pct = (y: number) => `${((y - top) / height) * 100}%`;

  return (
    <section ref={ref} aria-labelledby="tree-title" className="relative overflow-hidden py-24 lg:py-[clamp(6rem,14vw,17rem)]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(70,18,110,0.55),transparent)]" />

      <div className="container-site relative">
        {/* ── Desktop: branching tree ── */}
        <div className="relative hidden [container-type:inline-size] lg:block">
          <div className="relative" style={{ aspectRatio: `1280 / ${height}` }}>
            <svg viewBox={`320 ${top} 1280 ${height}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="tree-g" gradientUnits="userSpaceOnUse" x1={FORK} x2={LINE_END.near} y1="0" y2="0">
                  <stop stopColor="#62229d" />
                  <stop offset="0.5" stopColor="#b72bca" />
                  <stop offset="1" stopColor="#e96ed8" />
                </linearGradient>
              </defs>
              <motion.path d={`M${TRUNK_START} ${CX} L ${FORK} ${CX}`} stroke="#b72bca" strokeWidth={1.2} style={{ pathLength: trunk }} />
              <motion.path d={`M${FORK} ${CX} L 1133 ${CX}`} stroke="url(#tree-g)" strokeWidth={1.2} style={{ pathLength: trunk }} />
              {branches.map((b, i) => (
                <BranchPath key={b.label} b={b} i={i} n={n} p={p} active={hover === i} reduce={reduce} />
              ))}
              {/* fork node */}
              <motion.circle cx={FORK} cy={CX} r={4} fill="#e96ed8" style={{ opacity: trunk }} className="drop-shadow-[0_0_8px_#e96ed8]" />
            </svg>

            {/* category title */}
            <motion.div style={{ opacity: titleO, x: titleX, top: pct(CX) }} className="absolute left-[1%] -translate-y-1/2">
              <h2 id="tree-title" className="font-display text-[2.5cqw] font-bold uppercase leading-none">
                {category}
              </h2>
              <motion.span aria-hidden style={{ scaleX: underline }} className="bg-brand-gradient mt-[1cqw] block h-[4px] origin-left rounded-full [width:calc(100%+2cqw)] -ml-[1cqw] shadow-[0_0_14px_rgba(233,110,216,0.7)]" />
            </motion.div>

            {/* logo at the end of the trunk */}
            <motion.div style={{ opacity: logoO, scale: logoS, filter: logoBlur, top: pct(CX) }} className="absolute left-[66.6%] w-[14.7%] -translate-y-1/2">
              <motion.div animate={reduce ? undefined : { filter: ["drop-shadow(0 0 0px rgba(233,224,42,0))", "drop-shadow(0 0 18px rgba(233,224,42,0.45))", "drop-shadow(0 0 0px rgba(233,224,42,0))"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <Image src="/images/logo.svg" alt="Hush Lush Technologies" width={188} height={64} className="h-auto w-full" />
              </motion.div>
            </motion.div>

            <ul aria-label={`${category} services`}>
              {branches.map((b, i) => (
                <Pill key={b.label} b={b} i={i} n={n} p={p} top={top} height={height} onHover={setHover} />
              ))}
            </ul>
          </div>
        </div>

        {/* ── Mobile / tablet: vertical tree ── */}
        <div className="lg:hidden">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="inline-block font-display text-[clamp(1.6rem,6vw,2.25rem)] font-bold uppercase leading-none"
          >
            {category}
            <span aria-hidden className="bg-brand-gradient mt-3 block h-[3px] rounded-full" />
          </motion.h2>
          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="relative mt-10 flex flex-col gap-4 pl-8 before:absolute before:bottom-6 before:left-2 before:top-6 before:w-px before:bg-gradient-to-b before:from-grad-end before:via-grad-mid before:to-grad-start"
          >
            {items.map((it) => (
              <motion.li
                key={it}
                variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}
                className="relative before:absolute before:-left-6 before:top-1/2 before:h-px before:w-5 before:bg-grad-mid after:absolute after:-left-[1.6rem] after:top-1/2 after:size-1.5 after:-translate-y-1/2 after:rounded-full after:bg-grad-start"
              >
                <a href={`#${slugify(it)}`} className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-[#120b1a]/90 px-5 font-display font-medium text-primary transition-colors active:border-grad-start/60">
                  {it}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
