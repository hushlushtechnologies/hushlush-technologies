"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/* Figma frame 1920 × 1319 */
const FW = 1920;
const FH = 1319;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

const WAVE =
  "M0 765 C 180 700, 260 494, 384 494 C 480 494, 560 530, 629 582 C 720 650, 800 760, 884 805 C 950 845, 1000 862, 1050 862 C 1150 862, 1220 790, 1281 694 C 1340 600, 1400 470, 1472 375 C 1580 250, 1700 182, 1800 182 C 1860 182, 1900 192, 1920 200";

type Stat = {
  value: number | null; // null → symbol (∞)
  prefix?: string;
  suffix: string;
  label: string[];
  dot: [number, number];
  big?: boolean;
};

const STATS: Stat[] = [
  { value: 14, suffix: "+", label: ["Service"], dot: [384, 494] },
  { value: 360, suffix: "°", label: ["Capability"], dot: [629, 582] },
  { value: 5, suffix: "+", label: ["Core", "Disciplines"], dot: [884, 805] },
  { value: null, suffix: "∞", label: ["Possibilities"], dot: [1281, 694] },
  { value: 15, suffix: "+", label: ["Industries", "Served"], dot: [1472, 375], big: true },
];

/* Line draws across this part of the pinned scroll */
const DRAW: [number, number] = [0.08, 0.82];

/* ───────────────────────── Bars (deterministic "audio wave") ───────────────────────── */

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
type Bar = { x: number; top: number; bottom: number; purple: boolean; dur: number; delay: number };
const BARS: Bar[] = (() => {
  const r = rng(42);
  const out: Bar[] = [];
  for (let x = 6; x < FW; x += 27.5) {
    const centre = 600 + (r() - 0.5) * 60;
    const tall = r() < 0.18;
    const half = (tall ? 260 + r() * 220 : 90 + r() * 200) * (x > 900 && x < 1100 ? 1.25 : 1);
    out.push({
      x,
      top: centre - half * (0.7 + r() * 0.6),
      bottom: centre + half * (0.7 + r() * 0.6),
      purple: r() > 0.38,
      dur: 1.6 + r() * 2.4,
      delay: -r() * 4,
    });
  }
  return out;
})();

function BarLine({ bar, progress, reduce }: { bar: Bar; progress: MotionValue<number>; reduce: boolean }) {
  // the bar "switches on" when the wave head passes its x
  const at = DRAW[0] + (bar.x / FW) * (DRAW[1] - DRAW[0]);
  const on = useTransform(progress, [at - 0.12, at], [0, 1]);
  const scaleY = useTransform(on, [0, 1], [0.15, 1]);
  const opacity = useTransform(on, [0, 1], [0.12, bar.purple ? 0.85 : 0.55]);
  return (
    <motion.g style={{ scaleY, opacity, transformOrigin: `${bar.x}px ${(bar.top + bar.bottom) / 2}px`, transformBox: "view-box" } as unknown as CSSProperties}>
      <line
        x1={bar.x}
        x2={bar.x}
        y1={bar.top}
        y2={bar.bottom}
        stroke={bar.purple ? "#8b2fc9" : "#123a4a"}
        strokeWidth={2}
        className={reduce ? undefined : "animate-[eq_var(--d)_ease-in-out_infinite]"}
        style={{ "--d": `${bar.dur}s`, animationDelay: `${bar.delay}s`, transformOrigin: `${bar.x}px ${(bar.top + bar.bottom) / 2}px`, transformBox: "view-box" } as CSSProperties}
      />
    </motion.g>
  );
}

/* ───────────────────────── Stat label ───────────────────────── */

function StatLabel({ s, at, progress }: { s: Stat; at: number; progress: MotionValue<number> }) {
  const k = useTransform(progress, [at - 0.01, at + 0.07], [0, 1]);
  const y = useTransform(k, [0, 1], [30, 0]);
  const filter = useTransform(k, (v) => `blur(${(1 - v) * 8}px)`);
  const count = useTransform(progress, [at, at + 0.1], [0, s.value ?? 0]);
  const text = useTransform(count, (v) => `${Math.round(v)}${s.suffix}`);
  const infScale = useTransform(k, [0, 1], [0.2, 1]);
  const infRotate = useTransform(k, [0, 1], [-180, 0]);

  const [dx, dy] = s.dot;
  const top = s.big ? dy - 117 : dy - (s.label.length > 1 ? 112 : 78);
  return (
    <motion.div className="absolute" style={{ left: X(dx), top: Y(top), opacity: k, y, filter }}>
      <p className={s.big ? "font-display text-[max(16px,1.35cqw)] font-bold leading-none text-primary" : "font-display text-[max(11px,0.85cqw)] font-medium leading-none text-primary"}>
        {s.value === null ? (
          <motion.span className="inline-block" style={{ scale: infScale, rotate: infRotate }}>
            ∞
          </motion.span>
        ) : (
          <motion.span>{text}</motion.span>
        )}
      </p>
      <h3 className="mt-[0.6cqw] font-display text-[max(15px,1.4cqw)] font-semibold leading-[1.15] text-text-primary">
        {s.label.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </h3>
    </motion.div>
  );
}

function Dot({ s, at, progress }: { s: Stat; at: number; progress: MotionValue<number> }) {
  const k = useTransform(progress, [at - 0.015, at + 0.02], [0, 1]);
  const ring = useTransform(progress, [at, at + 0.08], [0, 1]);
  const ringR = useTransform(ring, [0, 1], [19, 60]);
  const ringO = useTransform(ring, [0, 0.2, 1], [0, 0.8, 0]);
  return (
    <g>
      <motion.circle cx={s.dot[0]} cy={s.dot[1]} r={ringR} fill="none" stroke="#b72bca" strokeWidth={2} style={{ opacity: ringO }} />
      <motion.circle
        cx={s.dot[0]}
        cy={s.dot[1]}
        r={19}
        fill="#6a22a8"
        style={{ scale: k, opacity: k, transformOrigin: `${s.dot[0]}px ${s.dot[1]}px`, transformBox: "view-box" } as unknown as CSSProperties}
      />
      <motion.g style={{ opacity: k }}>
        <circle cx={s.dot[0]} cy={s.dot[1]} r={6} fill="#e9a6ff" className="animate-pulse" />
      </motion.g>
    </g>
  );
}

/* ───────────────────────── Stage ───────────────────────── */

function Stage({ progress, reduce, showLabels }: { progress: MotionValue<number>; reduce: boolean; showLabels: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [fractions, setFractions] = useState<number[]>(STATS.map((s) => s.dot[0] / FW));
  const [head, setHead] = useState<[number, number]>([0, 765]);
  const draw = useTransform(progress, DRAW, [0, 1]);

  // where along the curve each dot sits (0–1), measured from the real path
  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    const fracs = STATS.map((s) => {
      let lo = 0;
      let hi = L;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (p.getPointAtLength(mid).x < s.dot[0]) lo = mid;
        else hi = mid;
      }
      return lo / L;
    });
    setFractions(fracs);
  }, []);

  // glowing head travelling with the line
  useMotionValueEvent(draw, "change", (v) => {
    const p = pathRef.current;
    if (!p) return;
    const pt = p.getPointAtLength(p.getTotalLength() * v);
    setHead([pt.x, pt.y]);
  });
  const headOpacity = useTransform(draw, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const glow = useTransform(progress, [0, 0.4, 1], [0.3, 1, 0.8]);

  const atOf = (i: number) => DRAW[0] + fractions[i] * (DRAW[1] - DRAW[0]);

  return (
    <div className="relative size-full [container-type:inline-size]">
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_52%,rgba(80,20,120,0.55),transparent_75%)]"
      />
      <svg aria-hidden viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 size-full overflow-visible">
        <defs>
          <linearGradient id="wave-g" x1="0" x2="1">
            <stop stopColor="#62229d" />
            <stop offset="0.5" stopColor="#b72bca" />
            <stop offset="1" stopColor="#e96ed8" />
          </linearGradient>
          <filter id="wave-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {BARS.map((b, i) => (
          <BarLine key={i} bar={b} progress={progress} reduce={reduce} />
        ))}

        {/* faint full track + drawn line with glow */}
        <path d={WAVE} fill="none" stroke="#3a1660" strokeOpacity={0.35} strokeWidth={1.5} />
        <motion.path d={WAVE} fill="none" stroke="#b72bca" strokeWidth={6} filter="url(#wave-glow)" style={{ pathLength: draw, opacity: 0.6 }} />
        <motion.path ref={pathRef} d={WAVE} fill="none" stroke="url(#wave-g)" strokeWidth={2} style={{ pathLength: draw }} />

        {/* travelling head */}
        <motion.g style={{ opacity: headOpacity }}>
          <circle cx={head[0]} cy={head[1]} r={22} fill="#e96ed8" opacity={0.25} filter="url(#wave-glow)" />
          <circle cx={head[0]} cy={head[1]} r={5} fill="#fff" />
        </motion.g>

        {STATS.map((s, i) => (
          <Dot key={i} s={s} at={atOf(i)} progress={progress} />
        ))}
      </svg>

      {showLabels &&
        STATS.map((s, i) => <StatLabel key={i} s={s} at={atOf(i)} progress={progress} />)}
    </div>
  );
}

/* ───────────────────────── Mobile stat list ───────────────────────── */

function MobileList({ progress }: { progress: MotionValue<number> }) {
  return (
    <ul className="container-site relative -mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
      {STATS.map((s, i) => (
        <MobileStat key={i} s={s} i={i} progress={progress} />
      ))}
    </ul>
  );
}
function MobileStat({ s, i, progress }: { s: Stat; i: number; progress: MotionValue<number> }) {
  const at = 0.15 + i * 0.07;
  const count = useTransform(progress, [at, at + 0.15], [0, s.value ?? 0]);
  const text = useTransform(count, (v) => (s.value === null ? s.suffix : `${Math.round(v)}${s.suffix}`));
  const k = useTransform(progress, [at - 0.05, at + 0.05], [0, 1]);
  return (
    <motion.li style={{ opacity: k }} className={i === STATS.length - 1 ? "col-span-2" : undefined}>
      <p className="font-display text-4xl font-bold text-primary">
        <motion.span>{text}</motion.span>
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{s.label.join(" ")}</h3>
    </motion.li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function Stats() {
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

  const pinned = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const flow = useScroll({ target: sectionRef, offset: ["start 0.8", "end 0.6"] });
  const progress = useMotionValue(reduce ? 1 : 0);
  const desktopRef = useRef(desktop);
  useEffect(() => {
    desktopRef.current = desktop;
    progress.set(reduce ? 1 : (desktop ? pinned : flow).scrollYProgress.get());
  }, [desktop, reduce, progress, pinned, flow]);
  useMotionValueEvent(pinned.scrollYProgress, "change", (v) => !reduce && desktopRef.current && progress.set(v));
  useMotionValueEvent(flow.scrollYProgress, "change", (v) => !reduce && !desktopRef.current && progress.set(v));

  return (
    <section ref={sectionRef} id="stats" aria-labelledby="stats-title" className="relative py-16 lg:h-[280vh] lg:py-0">
      <h2 id="stats-title" className="sr-only">
        Hush Lush In Numbers: 14+ services, 360° capability, 5+ core disciplines, endless possibilities, 15+ industries served
      </h2>

      {desktop ? (
        <div className="sticky top-0 h-dvh overflow-hidden">
          {/* full-bleed stage, centred vertically (top/bottom empty space is cropped on short screens) */}
          <div className="absolute inset-x-0 top-[calc(50%+40px)] -translate-y-1/2" style={{ aspectRatio: `${FW} / ${FH}` }}>
            <Stage progress={progress} reduce={reduce} showLabels />
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1920 / 1100" }}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2" style={{ aspectRatio: `${FW} / ${FH}` }}>
              <Stage progress={progress} reduce={reduce} showLabels={false} />
            </div>
          </div>
          <MobileList progress={progress} />
        </>
      )}
    </section>
  );
}
