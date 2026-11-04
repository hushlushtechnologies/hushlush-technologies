"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import CountUp from "@/components/ui/CountUp";
import type { ServicePage } from "@/lib/services";


type Data = NonNullable<ServicePage["insights"]>;

/* Figma frame 1920 × 1319 */
const W = 1920;
const H = 1319;
const CURVE = "M0 765 C 150 660 250 494 384 494 C 520 494 620 560 748 687 C 860 800 950 861 1044 861 C 1200 861 1330 560 1471 375 C 1580 240 1680 182 1800 182 C 1860 182 1900 192 1920 200";
const POINTS = [
  { x: 384, y: 494, at: 0.2 },
  { x: 748, y: 687, at: 0.39 },
  { x: 1044, y: 861, at: 0.55 },
  { x: 1471, y: 375, at: 0.76 },
];

/* deterministic "audio bars" behind the curve */
const BARS = Array.from({ length: 70 }, (_, i) => {
  const x = 6 + i * 27.4;
  const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const r2 = Math.abs(Math.sin(i * 78.233) * 12345.678) % 1;
  const centre = 600 + Math.sin(i / 7) * 60;
  const half = 80 + r * 330;
  return { x, y1: centre - half, y2: centre + half * (0.5 + r2 * 0.6), purple: r2 > 0.35, phase: r * 6 };
});

function Bar({ b, p, i }: { b: (typeof BARS)[number]; p: MotionValue<number>; i: number }) {
  const scaleY = useTransform(p, [0.02 + (i / BARS.length) * 0.5, 0.2 + (i / BARS.length) * 0.5], [0, 1]);
  return (
    <motion.line
      x1={b.x}
      x2={b.x}
      y1={b.y1}
      y2={b.y2}
      stroke={b.purple ? "#7b2fd0" : "#123038"}
      strokeWidth={2.4}
      strokeLinecap="round"
      style={{ scaleY, transformOrigin: `${b.x}px ${(b.y1 + b.y2) / 2}px`, transformBox: "view-box" }}
      opacity={b.purple ? 0.75 : 0.9}
    />
  );
}

function Point({ pt, stat, p, active }: { pt: (typeof POINTS)[number]; stat: Data["stats"][number]; p: MotionValue<number>; active: boolean }) {
  const scale = useTransform(p, [pt.at - 0.03, pt.at + 0.02], [0, 1]);
  const opacity = useTransform(p, [pt.at - 0.02, pt.at + 0.04], [0, 1]);
  const y = useTransform(p, [pt.at - 0.02, pt.at + 0.05], [20, 0]);
  return (
    <>
      <motion.div
        aria-hidden
        style={{ left: `${(pt.x / W) * 100}%`, top: `${(pt.y / H) * 100}%`, scale }}
        className="absolute size-[clamp(18px,2vw,38px)] -translate-x-1/2 -translate-y-1/2"
      >
        <span className="absolute inset-0 rounded-full bg-[#6a22c0] shadow-[0_0_30px_rgba(150,60,240,0.8)]" />
        <span className="absolute -inset-2 rounded-full border border-grad-start/50 motion-safe:animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
      </motion.div>
      <motion.div
        style={{ left: `${(pt.x / W) * 100}%`, top: `${(pt.y / H) * 100}%`, opacity, y }}
        className="absolute -translate-y-[calc(100%+clamp(12px,1.6vw,30px))] font-display"
      >
        <p className="text-sm font-medium leading-tight text-primary sm:text-[clamp(1rem,1.5vw,1.75rem)]">
          {active ? <CountUp to={stat.value} decimals={stat.decimals ?? 0} prefix={stat.prefix ?? ""} suffix={stat.suffix ?? ""} duration={1.4} /> : `${stat.prefix ?? ""}${stat.value.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ""}`}
        </p>
        <p className="text-sm font-medium leading-tight sm:text-[clamp(1rem,1.5vw,1.75rem)]">{stat.label}</p>
      </motion.div>
    </>
  );
}

export default function ServiceInsights({ data }: { data: Data }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [shown, setShown] = useState<number[]>([]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setPinned(mq.matches);
    const raf = requestAnimationFrame(on);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", on);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: pinned ? ["start start", "end end"] : ["start 0.85", "end 0.6"] });
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const p = useTransform(sp, (v) => (reduce ? 1 : v));

  useMotionValueEvent(p, "change", (v) => {
    const next = POINTS.map((pt, i) => (v >= pt.at ? i : -1)).filter((i) => i >= 0);
    if (next.length !== shown.length) setShown(next);
  });

  const draw = useTransform(p, [0.05, 0.85], [0, 1]);
  const headO = useTransform(p, [0, 0.08], [0, 1]);
  const headY = useTransform(p, [0, 0.1], [40, 0]);
  const glow = useTransform(p, [0, 0.5], [0.3, 1]);

  return (
    <section ref={ref} aria-labelledby="insights-title" className="relative lg:h-[260vh]">
      <div className="relative overflow-hidden py-16 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:items-center lg:py-0">
        <motion.div aria-hidden style={{ opacity: glow }} className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_55%,rgba(80,20,130,0.55),transparent)]" />

        <div className="relative mx-auto w-full max-w-[1920px] lg:max-w-[calc(100dvh*1.456)]">
          <div className="relative w-full lg:aspect-[1920/1319]">
            {/* copy */}
            <motion.div style={{ opacity: headO, y: headY }} className="container-site relative z-10 grid gap-4 lg:absolute lg:inset-x-0 lg:top-0 lg:grid-cols-[310fr_970fr] lg:gap-0 lg:pt-[7%]">
              <p className="whitespace-pre-line text-xs uppercase leading-tight tracking-wide text-text-primary/80 lg:pt-[3.5%] lg:text-[clamp(0.7rem,0.85vw,1rem)]">{data.eyebrow}</p>
              <h2 id="insights-title" className="text-[clamp(1.25rem,2.4vw,2.6rem)] leading-[1.15]">
                {data.title}
              </h2>
            </motion.div>

            {/* chart (taller on phones so labels have room) */}
            <div className="relative mt-6 aspect-[1/1.05] w-full lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <defs>
                <linearGradient id="ins-line" x1="0" x2="1" y1="0" y2="0">
                  <stop stopColor="#62229d" />
                  <stop offset="0.5" stopColor="#b72bca" />
                  <stop offset="1" stopColor="#e96ed8" />
                </linearGradient>
              </defs>
              <g>
                {BARS.map((b, i) => (
                  <g
                    key={i}
                    style={reduce ? undefined : { animation: `eq ${1.8 + b.phase * 0.5}s ease-in-out ${-b.phase}s infinite`, transformBox: "fill-box", transformOrigin: "center" }}
                  >
                    <Bar b={b} p={p} i={i} />
                  </g>
                ))}
              </g>
              <motion.path d={CURVE} fill="none" stroke="url(#ins-line)" strokeWidth={6} opacity={0.35} style={{ pathLength: draw }} className="blur-[6px]" />
              <motion.path d={CURVE} fill="none" stroke="url(#ins-line)" strokeWidth={2} style={{ pathLength: draw }} />
            </svg>

            <div className="absolute inset-0">
              {POINTS.map((pt, i) => (
                <Point key={i} pt={pt} stat={data.stats[i]} p={p} active={shown.includes(i)} />
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
