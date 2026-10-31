"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  BentoCard,
  EASE,
  Eyebrow,
  Floaty,
  ParallaxLayer,
  titleClass,
} from "./shared";
import { cn } from "@/lib/utils";

/* All geometry is in the card's Figma units (711 × 559) */
type Arrow = {
  d: string;
  from: [number, number];
  to: [number, number];
  width: number;
  head: number;
  delay: number;
};

const TRAILS = [
  "M-20 304 L54 242 L82 277 L232 152",
  "M-20 410 L45 336 L93 394 L363 180",
  "M150 580 L316 350",
  "M250 580 L319 534 L589 312",
];

const ARROWS: Arrow[] = [
  {
    d: "M82 277 L222 160",
    from: [82, 277],
    to: [222, 160],
    width: 7,
    head: 22,
    delay: 0.3,
  },
  {
    d: "M93 394 L350 191",
    from: [93, 394],
    to: [350, 191],
    width: 15,
    head: 44,
    delay: 0.15,
  },
  {
    d: "M200 512 L306 364",
    from: [200, 512],
    to: [306, 364],
    width: 7,
    head: 22,
    delay: 0.55,
  },
  {
    d: "M319 534 L577 322",
    from: [319, 534],
    to: [577, 322],
    width: 11,
    head: 36,
    delay: 0.4,
  },
];

/** Arrow-head triangle at the end of a line */
function headPoints(
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
  size: number,
) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const tip = [x2 + Math.cos(a) * size * 0.9, y2 + Math.sin(a) * size * 0.9];
  const back = [x2 - Math.cos(a) * size * 0.25, y2 - Math.sin(a) * size * 0.25];
  const px = Math.cos(a + Math.PI / 2) * size * 0.6;
  const py = Math.sin(a + Math.PI / 2) * size * 0.6;
  return `${tip[0]},${tip[1]} ${back[0] + px},${back[1] + py} ${x2},${y2} ${back[0] - px},${back[1] - py}`;
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

const CHIPS = [
  { label: "Insights", x: 237, y: 124, delay: 0.9 },
  { label: "Positioning", x: 370, y: 152, delay: 1.0 },
  { label: "Growth", x: 318, y: 320, delay: 1.15 },
  { label: "Planning", x: 598, y: 275, delay: 1.25, anchorRight: true },
];

/** Figma-style collaborator cursor with a name pill */
function Cursor({
  color,
  x,
  y,
  pillW,
  pillDir,
  path,
  delay,
  plane,
}: {
  color: string;
  x: number;
  y: number;
  pillW: number;
  pillDir: "left" | "right";
  path: { x: number[]; y: number[] };
  delay: number;
  plane?: boolean;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: pct(x, 711), top: pct(y, 559) }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <motion.div
        animate={{ x: path.x, y: path.y }}
        transition={{
          duration: 9,
          delay: delay + 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* pointer */}
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "absolute size-[max(14px,3.6cqw)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]",
            plane ? "-scale-x-100" : "",
          )}
          style={{
            color,
            left: pillDir === "left" ? "-1cqw" : "-2.4cqw",
            top: "-3.2cqw",
          }}
          aria-hidden
        >
          {plane ? (
            <path fill="currentColor" d="M22 2 2 9.5l8 3.2L13.5 22 22 2Z" />
          ) : (
            <path fill="currentColor" d="M3 2.5 20 10l-7.2 2.2L10 20 3 2.5Z" />
          )}
        </svg>
        {/* name pill */}
        <span
          className="block rounded-full"
          style={{
            background: color,
            width: `${(pillW / 711) * 100}cqw`,
            height: "max(12px, 4.1cqw)",
            transform: pillDir === "left" ? "translateX(-100%)" : undefined,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function StrategyCard({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <BentoCard className={className} depth={30} phase={0}>
      {/* Glows */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_55%_at_30%_30%,rgba(102,34,159,0.75),transparent_70%),radial-gradient(45%_45%_at_75%_55%,rgba(98,34,157,0.35),transparent_70%),linear-gradient(180deg,#14072a,#0b0810)]"
      />
      <motion.div
        aria-hidden
        className="absolute left-[22%] top-[18%] size-[40%] rounded-full bg-[#7b2cff]/40 blur-[70px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Illustration (scales with the card width) */}
      <div
        ref={ref}
        aria-hidden
        className="@container absolute inset-x-0 top-0 aspect-[711/559]"
      >
        <svg
          viewBox="0 0 711 559"
          className="absolute inset-0 size-full"
          fill="none"
        >
          <defs>
            {ARROWS.map((a, i) => (
              <linearGradient
                key={i}
                id={`arrow-g${i}`}
                gradientUnits="userSpaceOnUse"
                x1={a.from[0]}
                y1={a.from[1]}
                x2={a.to[0]}
                y2={a.to[1]}
              >
                <stop offset="0" stopColor="#62229d" stopOpacity="0" />
                <stop offset="0.6" stopColor="#9b5cf0" stopOpacity="0.8" />
                <stop offset="1" stopColor="#d2b2ff" />
              </linearGradient>
            ))}
          </defs>

          {TRAILS.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              stroke="#5b1fa0"
              strokeOpacity={0.35}
              strokeWidth={24}
              strokeLinejoin="miter"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.6, delay: 0.1 + i * 0.12, ease: EASE }}
            />
          ))}

          {ARROWS.map((a, i) => (
            <g key={a.d}>
              <motion.path
                d={a.d}
                stroke={`url(#arrow-g${i})`}
                strokeWidth={a.width}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.2, delay: a.delay + 0.3, ease: EASE }}
              />
              <motion.polygon
                points={headPoints(a.from, a.to, a.head)}
                fill="#cfa9ff"
                style={{
                  transformOrigin: `${a.to[0]}px ${a.to[1]}px`,
                  transformBox: "view-box",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: a.delay + 1.2, ease: EASE }}
              />
            </g>
          ))}
        </svg>

        {CHIPS.map((c, i) => (
          <motion.div
            key={c.label}
            className="absolute"
            // right-anchored chips stay inside the card on small screens
            style={
              "anchorRight" in c
                ? { right: "2.5%", top: pct(c.y, 559) }
                : { left: pct(c.x, 711), top: pct(c.y, 559) }
            }
            initial={{ opacity: 0, y: 14, scale: 0.8 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: c.delay, ease: EASE }}
          >
            <ParallaxLayer amount={[18, 30, 12, 24][i]}>
              <Floaty delay={i * 0.6} distance={5} duration={4 + i}>
                <span className="inline-flex whitespace-nowrap rounded-[1.4cqw] border border-white/10 bg-[#1b0f30]/90 px-[2.3cqw] py-[1cqw] text-[max(10px,1.97cqw)] leading-none text-text-primary/90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
                  {c.label}
                </span>
              </Floaty>
            </ParallaxLayer>
          </motion.div>
        ))}

        <ParallaxLayer amount={40} className="absolute inset-0">
          <Cursor
            color="#d6a69c"
            x={174}
            y={103}
            pillW={118}
            pillDir="left"
            plane
            delay={1.4}
            path={{ x: [0, 18, -10, 0], y: [0, -10, 8, 0] }}
          />
        </ParallaxLayer>
        <ParallaxLayer amount={26} className="absolute inset-0">
          <Cursor
            color="#e9e02a"
            x={536}
            y={377}
            pillW={130}
            pillDir="right"
            delay={1.6}
            path={{ x: [0, -24, 12, 0], y: [0, 10, -14, 0] }}
          />
        </ParallaxLayer>
      </div>

      {/* Copy */}
      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-end p-7 sm:min-h-[460px] lg:min-h-0 lg:p-[41px] lg:pb-[72px]">
        <Eyebrow>Strategy</Eyebrow>
        <h3
          className={cn(
            titleClass,
            "mt-3 text-[28px] sm:text-[32px] lg:text-[36px]",
          )}
        >
          Ideas With Direction
        </h3>
      </div>
    </BentoCard>
  );
}
