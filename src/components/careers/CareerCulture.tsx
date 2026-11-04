"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Sparkle } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Shared pieces ───────────────────────── */

const tile: Variants = {
  hidden: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)", y: 40 },
  show: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0, transition: { duration: 1.1, ease: EASE } },
};

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.article variants={tile} className={cn("group relative isolate overflow-hidden", className)}>
      {children}
    </motion.article>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <Sparkle
      className={cn(
        "size-8 text-primary drop-shadow-[0_0_10px_rgba(233,224,42,0.6)] transition-transform duration-700 ease-cinematic group-hover:rotate-180 group-hover:scale-125",
        className
      )}
    />
  );
}

function Copy({ no, title, kicker, body }: { no: string; title: string; kicker: string; body: string }) {
  return (
    <div className="relative z-10 transition-transform duration-500 ease-cinematic group-hover:-translate-y-1.5">
      <p className="font-display text-lg font-medium text-primary">{no}</p>
      <h3 className="mt-1 font-display text-[26px] font-bold leading-tight lg:text-[28px]">{title}</h3>
      <p className="mt-3 text-sm uppercase tracking-wide text-text-primary/55">{kicker}</p>
      <p className="mt-4 text-[15px] leading-[1.12] text-text-primary/90">{body}</p>
    </div>
  );
}

/* ───────────────────────── Growth curve ───────────────────────── */

const CURVE = "M30 340 C 220 335, 420 280, 520 70";

function Growth({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const draw = useTransform(progress, [0.15, 0.55], [0, 1]);
  const dotOpacity = useTransform(draw, [0, 0.05], [0, 1]);
  const word = useTransform(progress, [0.5, 0.6], [0, 1]);
  const wordY = useTransform(word, [0, 1], [20, 0]);
  const pathRef = useRef<SVGPathElement>(null);
  const [head, setHead] = useState<[number, number]>([30, 340]);
  const place = (v: number) => {
    const el = pathRef.current;
    if (!el) return;
    const pt = el.getPointAtLength(el.getTotalLength() * v);
    setHead([pt.x, pt.y]);
  };
  useMotionValueEvent(draw, "change", place);
  useLayoutEffect(() => place(draw.get()), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative h-full min-h-[320px] p-7 lg:p-9">
      <p className="relative z-10 font-display text-[clamp(22px,1.6vw,28px)] font-bold">
        A Day At Hush Lush ={" "}
        <motion.span style={{ opacity: word, y: wordY }} className="inline-block text-primary">
          Growth
        </motion.span>
      </p>
      <svg viewBox="0 0 600 380" className="absolute inset-x-6 bottom-6 top-16 h-[calc(100%-88px)] w-[calc(100%-48px)] overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="growth-g" x1="0" x2="1">
            <stop stopColor="#62229d" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#b72bca" />
            <stop offset="1" stopColor="#e96ed8" />
          </linearGradient>
          <filter id="growth-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {/* faint grid */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} x2={600} y1={95 * i + 20} y2={95 * i + 20} stroke="white" strokeOpacity={0.04} vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={CURVE} fill="none" stroke="#b72bca" strokeWidth={8} filter="url(#growth-glow)" style={{ pathLength: draw, opacity: 0.5 }} vectorEffect="non-scaling-stroke" />
        <motion.path ref={pathRef} d={CURVE} fill="none" stroke="url(#growth-g)" strokeWidth={3} strokeLinecap="round" style={{ pathLength: draw }} vectorEffect="non-scaling-stroke" />
      </svg>
      {/* glowing head rides the end of the curve */}
      <motion.span
        aria-hidden
        className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#f3a6ff,#b72bca_55%,#62229d)] shadow-[0_0_30px_8px_rgba(183,43,202,0.7)]"
        style={{ opacity: dotOpacity, left: `calc(24px + (100% - 48px) * ${head[0] / 600})`, top: `calc(64px + (100% - 88px) * ${head[1] / 380})` }}
        animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

/* ───────────────────────── Iceberg tile ───────────────────────── */

const TAGS = [
  { t: "Curious", x: "8%", y: "47%", r: -14 },
  { t: "Energy", x: "62%", y: "48%", r: 8 },
  { t: "Team Work", x: "28%", y: "56%", r: 10 },
  { t: "Fun", x: "20%", y: "66%", r: -8 },
  { t: "Learn", x: "52%", y: "64%", r: -12 },
  { t: "People", x: "36%", y: "71%", r: 0 },
];

function Iceberg() {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="absolute inset-x-0 top-[30%] aspect-[667/742]">
        <div className="relative size-full animate-[float_8s_ease-in-out_infinite] motion-reduce:animate-none">
          <Image src="/images/careers/iceberg.webp" alt="Crystal iceberg — most of the culture lives beneath the surface" fill sizes="320px" className="object-contain" />
          {/* waterline shimmer */}
          <motion.span
            aria-hidden
            className="absolute inset-x-[8%] top-[22%] h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(240,200,255,0.9),transparent)] blur-[1px]"
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
      {TAGS.map((tag, i) => (
        <motion.span
          key={tag.t}
          className="absolute z-10"
          style={{ left: tag.x, top: tag.y }}
          variants={{
            hidden: { opacity: 0, scale: 0.4, rotate: tag.r + 40 },
            show: { opacity: 1, scale: 1, rotate: tag.r, transition: { duration: 0.7, delay: 0.6 + i * 0.12, ease: EASE } },
          }}
        >
          <span className="block animate-[float_5s_ease-in-out_infinite] motion-reduce:animate-none" style={{ animationDelay: `${i * -0.8}s` }}>
            <span className="inline-flex whitespace-nowrap rounded-lg border border-white/10 bg-[#1a0e2a]/85 px-3 py-1 text-sm text-primary backdrop-blur-sm transition-transform duration-300 hover:scale-115">
              {tag.t}
            </span>
          </span>
        </motion.span>
      ))}
    </>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function CareerCulture() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));

  // scroll parallax / living gradients
  const g1 = useTransform(progress, [0, 1], ["0% 0%", "100% 100%"]);
  const brainScale = useTransform(progress, [0.2, 0.8], reduce ? [1, 1] : [1.25, 1]);
  const brainGlow = useTransform(progress, [0.3, 0.5, 0.7], [0.4, 1, 0.6]);
  const col1Y = useTransform(progress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const col4Y = useTransform(progress, [0, 1], reduce ? [0, 0] : [-30, 30]);

  return (
    <section ref={ref} id="culture" aria-label="Life at Hush Lush" className="relative py-24 lg:py-[200px]">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        className="container-site grid gap-0 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[396px_396px]"
      >
        {/* 01 — tall gradient tile */}
        <motion.div style={{ y: col1Y }} className="sm:row-span-2 lg:row-span-2">
          <Tile className="flex h-full min-h-[560px] flex-col justify-between p-7 lg:p-[18px] lg:pb-6">
            <motion.div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,#060508_8%,#3b0e6b_35%,#6a28b0_55%,#c7a6e6_78%,#7d4cc0_100%)] bg-[length:180%_180%]"
              style={{ backgroundPosition: g1 }}
            />
            <h2 className="font-display text-[clamp(24px,1.7vw,30px)] font-bold uppercase leading-[1.05]">
              More Than A
              <br />
              Job
            </h2>
            <div>
              <Star className="mb-[120px] hidden lg:block" />
              <Copy no="01" title="Think Freely" kicker="Question Everything." body="We Encourage Curiosity, New Perspectives And Ideas That Challenge The Expected." />
            </div>
          </Tile>
        </motion.div>

        {/* Growth — spans 2 columns on top */}
        <Tile className="bg-[#050407] sm:col-span-1 lg:col-span-2">
          <Growth progress={progress} />
        </Tile>

        {/* 04 — iceberg, tall */}
        <motion.div style={{ y: col4Y }} className="sm:row-span-2 lg:col-start-4 lg:row-span-2 lg:row-start-1">
          <Tile className="flex h-full min-h-[640px] flex-col justify-between bg-[linear-gradient(180deg,#3d0f6e,#4c1488_60%,#3a0e66)] p-7 lg:p-[18px] lg:pb-6">
            <Star />
            <Iceberg />
            <Copy no="04" title="Enjoy The Process" kicker="Serious About The Work. Not Too Serious About Ourselves." body="Because Creativity Needs Energy, Personality And A Little Fun." />
          </Tile>
        </motion.div>

        {/* 02 */}
        <Tile className="flex min-h-[396px] flex-col justify-between p-7 lg:col-start-2 lg:row-start-2 lg:p-[18px] lg:pb-6">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(200deg,#120418_20%,#3a0f66_55%,#6e3fc0_100%)]" />
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_40%,rgba(233,110,216,0.25)_55%,transparent_70%)] bg-[length:250%_100%]"
            animate={reduce ? undefined : { backgroundPosition: ["150% 0", "-50% 0"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <Star />
          <Copy no="02" title="Make Together" kicker="Better Ideas Don’t Happen Alone." body="Designers, Developers, Strategists, Creators And Marketers Work Together Instead Of Working In Silos." />
        </Tile>

        {/* 03 — brain */}
        <Tile className="flex min-h-[396px] flex-col justify-between bg-[#090909] p-7 lg:col-start-3 lg:row-start-2 lg:p-[18px] lg:pb-6">
          <motion.div aria-hidden className="absolute inset-0 -z-10" style={{ scale: brainScale }}>
            <Image src="/images/careers/brain.webp" alt="" fill sizes="320px" className="object-cover object-[50%_42%] transition-transform duration-[1.2s] ease-cinematic group-hover:scale-110" />
          </motion.div>
          <motion.div aria-hidden style={{ opacity: brainGlow }} className="absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_50%_45%,rgba(140,80,255,0.35),transparent_70%)] mix-blend-screen" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          <Star />
          <Copy no="03" title="Keep Experimenting" kicker="Try. Test. Break. Rebuild." body="We Make Room For Experimentation, New Technology And Unconventional Approaches." />
        </Tile>
      </motion.div>
    </section>
  );
}
