"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { DepthModel, type DepthModelConfig } from "@/components/three/DepthModel";
import { useIntroReady } from "@/lib/intro";
import { ArrowRight } from "@/components/ui/icons";
import { isLite } from "@/lib/perf";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Figma frame 1920 × 1080 */
const FW = 1920;
const FH = 1080;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

const HEAD: DepthModelConfig = {
  src: "/images/about/head-shatter.webp",
  depthSrc: "/images/about/head-shatter-depth.png",
  alt: "Sculpted head cracking apart into glowing purple glass shards",
  aspect: 1114 / 1100,
  depthSize: [360, 364],
  strength: 0.3,
  rotY: [0.28, -0.35],
  rotX: [0.04, -0.12],
  scale: [1, 1.08],
  widen: 1.3,
  sizes: "(min-width: 1024px) 80vw, 140vw",
};

/* ───────────────────────── Flying glass shards (canvas) ───────────────────────── */

type Shard = {
  x: number; // home position in frame px
  y: number;
  r: number; // size
  sides: number;
  rot: number;
  spin: number;
  hue: number;
  light: number;
  phase: number;
  vx: number; // explode direction
  vy: number;
  z: number; // depth (parallax + explode speed)
};

const SHARDS: Shard[] = (() => {
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 70 }, () => {
    // cluster up and to the right of the cracked skull, like the render
    const t = r();
    const x = 1150 + t * 560 + (r() - 0.5) * 160;
    const y = 40 + (1 - t) * 420 + (r() - 0.5) * 260;
    const z = 0.4 + r() * 1.2;
    const ang = -0.6 + (r() - 0.5) * 1.6;
    return {
      x,
      y,
      r: (5 + r() * 16) * z,
      sides: 3 + Math.floor(r() * 2),
      rot: r() * Math.PI * 2,
      spin: (r() - 0.5) * 0.6,
      hue: 255 + r() * 45,
      light: 55 + r() * 25,
      phase: r() * Math.PI * 2,
      vx: Math.cos(ang),
      vy: Math.sin(ang),
      z,
    };
  });
})();

function ShardField({ progress, intro, mx, my }: { progress: MotionValue<number>; intro: MotionValue<number>; mx: MotionValue<number>; my: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c || isLite()) return;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(c);

    const loop = (now: number) => {
      const t = now / 1000;
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

      const k = w / FW; // frame → px
      const p = progress.get(); // 0 → 1 while scrolling past
      const inK = intro.get(); // 0 → 1 intro assemble
      const explode = Math.pow(p, 1.4);

      for (const s of SHARDS) {
        // intro: shards rush in from far out; scroll: blast toward the viewer
        const away = (1 - inK) * 900 * s.z + explode * 1100 * s.z;
        const drift = reduce ? 0 : Math.sin(t * 0.6 + s.phase) * 10 * s.z;
        const x = (s.x + s.vx * away + drift + mx.get() * 40 * s.z) * k;
        const y = (s.y + s.vy * away + Math.cos(t * 0.5 + s.phase) * 8 * s.z + my.get() * 30 * s.z) * k;
        const size = s.r * k * (1 + explode * 2.2 * s.z);
        const rot = s.rot + (reduce ? 0 : t * s.spin) + (1 - inK) * 4 + explode * 3 * s.spin;
        const alpha = Math.min(1, inK * 1.4) * (1 - Math.max(0, explode - 0.3) / 0.7);
        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = alpha * (0.45 + 0.4 * (s.z / 1.6));
        const g = ctx.createLinearGradient(-size, -size, size, size);
        g.addColorStop(0, `hsl(${s.hue} 90% ${s.light + 15}%)`);
        g.addColorStop(1, `hsl(${s.hue - 20} 80% ${s.light - 25}%)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        for (let i = 0; i < s.sides; i++) {
          const a = (i / s.sides) * Math.PI * 2 + (i % 2) * 0.4;
          const rr = size * (i % 2 ? 0.55 : 1);
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.7);
        }
        ctx.closePath();
        ctx.fill();
        // bright edge
        ctx.globalAlpha *= 0.6;
        ctx.strokeStyle = "rgba(255,230,255,0.8)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }

      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [progress, intro, mx, my, reduce]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/* ───────────────────────── Copy pieces ───────────────────────── */

const line: Variants = {
  hidden: { y: "110%", rotate: 3 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

const LINES = [
  { t: "We Are A Creative", dim: false },
  { t: "Technology Company", dim: false },
  { t: "Built To Turn Bold", dim: true },
  { t: "Ideas Into What’s Next.", dim: true },
];

function DimLine({ text, progress, i }: { text: string; progress: MotionValue<number>; i: number }) {
  // the two muted lines light up as you begin to scroll
  const opacity = useTransform(progress, [0.02 + i * 0.05, 0.14 + i * 0.05], [0.55, 1]);
  return <motion.span style={{ opacity }}>{text}</motion.span>;
}

/* ───────────────────────── Section ───────────────────────── */

export default function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const ready = useIntroReady();

  // 0 at the top of the page → 1 when the hero has scrolled away
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 0 : v));

  // intro assemble (shards fly in) once the preloader opens
  const intro = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!ready) return;
    if (reduce) {
      intro.set(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1800);
      intro.set(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ready, reduce, intro]);

  // mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  /* Scroll choreography */
  const headY = useTransform(progress, [0, 1], ["0%", "-18%"]);
  const headScale = useTransform(progress, [0, 1], [1, 1.25]);
  const headOpacity = useTransform(progress, [0.45, 0.9], [1, 0]);
  const headFilter = useTransform(progress, [0.3, 0.9], ["blur(0px)", "blur(8px)"]);
  const arcScale = useTransform(progress, [0, 1], [1, 1.35]);
  const arcY = useTransform(progress, [0, 1], ["0%", "12%"]);
  const arcOpacity = useTransform(progress, [0.5, 1], [1, 0]);
  const leftX = useTransform(progress, [0, 1], [0, -160]);
  const rightX = useTransform(progress, [0, 1], [0, 160]);
  const copyOpacity = useTransform(progress, [0.3, 0.7], [1, 0]);
  const bgShift = useTransform(progress, [0, 1], ["0%", "-25%"]);
  const headIntro = useTransform(intro, (v) => `inset(${(1 - v) * 100}% 0% 0% 0%)`);

  return (
    <section ref={ref} aria-labelledby="about-title" className="relative h-[130vh] min-h-[860px]">
      <div className="sticky top-0 h-dvh min-h-[700px] overflow-hidden">
        {/* Light → purple → black backdrop from the design */}
        <motion.div
          aria-hidden
          style={{ y: bgShift }}
          className="absolute inset-x-0 top-0 h-[135%] bg-[linear-gradient(180deg,#f4f1f7_0%,#f1ecf6_18%,#c9a8e6_30%,#6a1fa8_45%,#2b0b47_60%,#060508_72%)]"
        />

        {/* Stage keeps the Figma proportions */}
        <div
          // phones: smaller stage pulled up so the head sits behind the top of the copy, softened
          className="absolute left-1/2 top-[38%] w-[max(100vw,120dvh)] -translate-x-1/2 -translate-y-1/2 opacity-60 [container-type:inline-size] lg:top-1/2 lg:w-[max(100vw,177.78dvh)] lg:opacity-100"
          style={{ aspectRatio: `${FW} / ${FH}` } as CSSProperties}
        >
          {/* Arc ring */}
          <motion.svg
            aria-hidden
            viewBox="0 0 1100 420"
            className="absolute"
            style={{ left: X(410), top: Y(560), width: X(1100), scale: arcScale, y: arcY, opacity: arcOpacity }}
          >
            <defs>
              <linearGradient id="arc-g" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#3b0f63" />
                <stop offset="1" stopColor="#4a1680" />
              </linearGradient>
            </defs>
            <motion.path
              d="M40 25 A510 350 0 0 0 1060 25"
              fill="none"
              stroke="url(#arc-g)"
              strokeWidth={84}
              initial={{ pathLength: 0 }}
              animate={ready ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
            />
          </motion.svg>

          {/* 3D head */}
          <motion.div
            className="absolute"
            style={{ left: X(183), top: Y(-261), width: X(1530), y: headY, scale: headScale, opacity: headOpacity, filter: headFilter, clipPath: reduce ? undefined : headIntro }}
          >
            <DepthModel progress={progress} config={HEAD} />
          </motion.div>

          {/* Shards in front */}
          <ShardField progress={progress} intro={intro} mx={mx} my={my} />
        </div>

        {/* Phones: the copy sits over the bright top of the backdrop — darken it for legibility */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[75%] bg-[linear-gradient(180deg,rgba(6,5,8,0.7)_0%,rgba(30,8,50,0.55)_45%,transparent_100%)] lg:hidden" />

        {/* Copy */}
        <div className="container-site relative z-10 grid h-full grid-cols-1 content-center gap-10 pt-24 lg:grid-cols-[1fr_auto] lg:content-start lg:items-start lg:pt-[30.5vh]">
          <motion.div
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
            style={{ x: leftX, opacity: copyOpacity }}
          >
            <h1 id="about-title" className="font-display text-[clamp(2.25rem,2.55vw,3.25rem)] font-bold uppercase leading-[1.04] text-text-primary drop-shadow-[0_4px_30px_rgba(40,0,80,0.45)]">
              {LINES.map((l, i) => (
                <span key={l.t} className="block overflow-hidden pb-[0.04em]">
                  <motion.span variants={line} className="block">
                    {l.dim ? <DimLine text={l.t} progress={progress} i={i - 2} /> : l.t}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div variants={fadeUp} className="mt-10 lg:mt-[45px]">
              <Link
                href="#our-story"
                className="bg-brand-gradient group relative inline-flex h-[50px] items-center overflow-hidden rounded-full px-8 text-base font-medium shadow-[0_10px_40px_-12px_rgba(183,43,202,0.7)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)]"
              >
                <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
                <span className="relative">Explore Our Story</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
            style={{ x: rightX, opacity: copyOpacity }}
            className="lg:w-[270px]"
          >
            <motion.p variants={fadeUp} className="text-base leading-[1.2] text-text-primary/90 lg:text-[15px] lg:leading-[1.08] lg:text-ink">
              We Bring Strategy, Creativity, Technology, Production And Growth Together To Build Brands, Experiences And Digital Products That Move Businesses Forward.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6">
              <Link
                href="/#services"
                className="group inline-flex h-[49px] items-center gap-8 whitespace-nowrap rounded-full border border-transparent pl-6 pr-[5px] text-base font-medium transition-shadow duration-500 [background:linear-gradient(#2a0b45,#2a0b45)_padding-box,linear-gradient(270deg,#e96ed8_0%,#b72bca_50.12%,#62229d_100%)_border-box] hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.8)]"
              >
                Explore Our Service
                <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
                  <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          aria-hidden
          style={{ opacity: copyOpacity }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-text-primary/50"
        >
          SCROLL
          <span className="h-10 w-px overflow-hidden bg-white/15">
            <span className="block h-1/2 w-full animate-[scrollcue_1.8s_ease-in-out_infinite] bg-primary" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
