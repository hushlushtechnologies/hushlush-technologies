"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";
import { serviceHref } from "@/lib/navigation";
import { ArrowRight, Sparkle } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

export type CapItem = { no: string; title: string; line: string; href: string; indent?: boolean };
export type CapConfig = {
  id: string;
  title: string;
  items: CapItem[];
  image: { src: string; alt: string; aspect: string; objectPosition?: string; tint?: boolean; maxWidth?: string; feather?: boolean };
  /** direction of the light that travels over the image as you scroll */
  sweep: "x" | "y";
  /** small sparkle tile next to the arrow */
  icon: boolean;
};

const ITEMS: CapItem[] = [
  { no: "01", title: "Brand", line: "Build The Identity.", href: serviceHref("Branding & Identity"), indent: false },
  { no: "02", title: "Create", line: "Bring Ideas To Life.", href: serviceHref("Production Service"), indent: true },
  { no: "03", title: "Amplify", line: "Put Brands In Motion.", href: serviceHref("Digital Marketing"), indent: false },
  { no: "04", title: "Digital", line: "Build The Experience.", href: serviceHref("Software Solution"), indent: true },
  { no: "05", title: "Commerce", line: "Turn Attention Into Growth.", href: serviceHref("Software Solution", "E - Commerce Solution"), indent: false },
];

/*
 * Desktop timeline (pinned, p: 0 → 1)
 *   0.00 – 0.14  title + queen open up in the centre
 *   0.12 – 0.26  queen glides left and shrinks; card column fades in
 *   0.24 – 0.86  cards 01 → 05 fly in one by one; the newest one is "active"
 *   0.86 – 1.00  hold
 */
const CARD_START = 0.24;
const CARD_STEP = 0.12;
const cardWindow = (i: number) => [CARD_START + i * CARD_STEP, CARD_START + i * CARD_STEP + 0.08] as const;

/* ───────────────────────── Queen visual ───────────────────────── */

function QueenCard({ progress, pinned, cfg }: { progress: MotionValue<number>; pinned: boolean; cfg: CapConfig }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const open: [number, number] = pinned ? [0, 0.14] : [0.05, 0.4];

  // opens from a slit, rises and un-tilts
  const rotateX = useTransform(progress, open, reduce ? [0, 0] : [18, 0]);
  const y = useTransform(progress, open, reduce ? [0, 0] : [120, 0]);
  const clip = useTransform(progress, open, reduce ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(30% 20% 30% 20%)", "inset(0% 0% 0% 0%)"]);
  const imgScale = useTransform(progress, [0, 1], reduce ? [1.05, 1.05] : [1.35, 1.02]);
  const imgY = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-4%"]);
  const lightX = useTransform(progress, [0.1, 0.9], ["-20%", "120%"]);
  // vertical variant: a band of light climbs from the bottom to the top
  const lightY = useTransform(progress, [0.2, 0.9], ["110%", "-30%"]);
  // the queen "turns" a little and flares each time a new card lands
  const turnInput = [0, ...[0, 1, 2, 3, 4].map((i) => cardWindow(i)[1]), 1];
  const turnY = useTransform(progress, turnInput, reduce ? turnInput.map(() => 0) : [0, -10, 6, -6, 8, -4, 0]);
  const pulses = [0, 1, 2, 3, 4].flatMap((i) => {
    const [, b] = cardWindow(i);
    return [b - 0.02, b, b + 0.05];
  });
  const glow = useTransform(progress, pinned ? [0, ...pulses, 1] : [0, 0.2, 0.55, 0.9, 1], pinned ? [0.3, ...pulses.map((_, j) => (j % 3 === 1 ? 1 : 0.45)), 0.6] : [0.3, 0.3, 1, 0.6, 0.6]);

  // mouse tilt + spotlight
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltY = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 120, damping: 18 });
  const tiltX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 120, damping: 18 });
  const rx = useTransform(() => rotateX.get() + tiltX.get());
  const ry = useTransform(() => tiltY.get() + turnY.get());
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    px.set(fx);
    py.set(fy);
    ref.current.style.setProperty("--mx", `${fx * 100}%`);
    ref.current.style.setProperty("--my", `${fy * 100}%`);
  };

  return (
    <div className="[perspective:1400px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, y, clipPath: clip, aspectRatio: cfg.image.aspect, ...(cfg.image.feather ? { WebkitMaskImage: "radial-gradient(60% 55% at 50% 52%, #000 55%, transparent 100%)", maskImage: "radial-gradient(60% 55% at 50% 52%, #000 55%, transparent 100%)" } : {}) }}
        className="group relative overflow-hidden bg-[#03020a] motion-reduce:!transform-none"
      >
        <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
          <Image
            src={cfg.image.src}
            alt={cfg.image.alt}
            fill
            sizes="(min-width: 1024px) 736px, 100vw"
            className="object-cover"
            style={{ objectPosition: cfg.image.objectPosition }}
          />
        </motion.div>
        {/* lilac tint to match the design (the source render is silver) */}
        {cfg.image.tint && <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#a88ad6] opacity-50 mix-blend-color" />}
        {/* breathing purple glow */}
        <motion.div
          aria-hidden
          style={{ opacity: glow }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_55%,rgba(183,43,202,0.35),transparent_70%)] mix-blend-screen"
        />
        {/* light sweeping across the glass as you scroll */}
        {cfg.sweep === "x" ? (
          <motion.div
            aria-hidden
            style={{ left: lightX }}
            className="pointer-events-none absolute inset-y-0 w-1/3 -translate-x-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay blur-md"
          />
        ) : (
          <motion.div
            aria-hidden
            style={{ top: lightY }}
            className="pointer-events-none absolute inset-x-0 h-1/4 -translate-y-1/2 -skew-y-6 bg-gradient-to-b from-transparent via-[rgba(200,170,255,0.45)] to-transparent mix-blend-screen blur-lg"
          />
        )}
        {/* mouse spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(320px circle at var(--mx,50%) var(--my,50%), rgba(233,180,255,0.25), transparent 60%)" }}
        />
        {/* fade edges into the page */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_40px_#060508]" />
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Capability rows ───────────────────────── */

function Branch({ progress, at }: { progress: MotionValue<number>; at: number }) {
  const draw = useTransform(progress, [at, at + 0.12], [0, 1]);
  return (
    <svg aria-hidden viewBox="0 0 100 180" className="absolute left-[3%] top-[-6px] hidden h-[calc(100%+12px)] w-[130px] overflow-visible md:block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cap-branch" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#62229d" />
          <stop offset="0.5" stopColor="#b72bca" />
          <stop offset="1" stopColor="#62229d" />
        </linearGradient>
      </defs>
      <motion.path d="M20 0 V60 Q20 90 50 90 H96" fill="none" stroke="url(#cap-branch)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
      <motion.path d="M20 180 V120 Q20 90 50 90" fill="none" stroke="url(#cap-branch)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
    </svg>
  );
}

function Row({ item, i, progress, pinned, cfg }: { item: CapItem; i: number; progress: MotionValue<number>; pinned: boolean; cfg: CapConfig }) {
  const [a, b] = pinned ? cardWindow(i) : ([0.12 + i * 0.07, 0.26 + i * 0.07] as const);
  const at = a;
  const k = useTransform(progress, [a, b], [0, 1]);
  // active = newest card: glows until the next one lands (last stays active)
  const next = pinned && i < cfg.items.length - 1 ? cardWindow(i + 1)[1] : 2;
  const active = useTransform(progress, [b - 0.02, b, next - 0.03, next], [0, 1, 1, 0]);
  const shadow = useTransform(active, (v) => `0 0 0 1px rgba(233,110,216,${0.55 * v}), 0 24px 70px -20px rgba(183,43,202,${0.75 * v})`);
  const scale = useTransform(active, [0, 1], [1, pinned ? 1.03 : 1]);
  const [isActive, setIsActive] = useState(false);
  useMotionValueEvent(active, "change", (v) => setIsActive(pinned && v > 0.5));
  const x = useTransform(k, [0, 1], [item.indent ? 140 : 90, 0]);
  const filter = useTransform(k, (v) => `blur(${(1 - v) * 10}px)`);
  const rotateY = useTransform(k, [0, 1], [-25, 0]);

  return (
    <li className={cn("relative [perspective:1000px]", item.indent && "md:pl-[150px]")}>
      {item.indent && <Branch progress={progress} at={at - 0.05} />}
      <motion.div style={{ x, opacity: k, filter, rotateY, scale, boxShadow: pinned ? shadow : undefined }} className="rounded-[22px]">
        <Link
          href={item.href}
          className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#100c16] px-4 py-5 transition-all duration-500 hover:border-grad-mid/50 hover:bg-[#170f21] hover:shadow-[0_20px_60px_-25px_rgba(183,43,202,0.7)] sm:px-[16px] sm:py-[22px] lg:py-[1.5vh]"
        >
          {/* gradient fill sweeping in on hover */}
          <span aria-hidden className={cn("bg-brand-gradient pointer-events-none absolute inset-0 origin-left opacity-[0.12] transition-transform duration-700 ease-cinematic group-hover:scale-x-100", isActive ? "scale-x-100" : "scale-x-0")} />
          <div className="relative">
            <p className="flex items-center gap-2 font-display text-base font-medium text-primary">
              {item.no}
              <span className={cn("h-px bg-primary transition-all duration-500", isActive ? "w-10 opacity-100" : "w-0 opacity-0")} />
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5 lg:text-[clamp(20px,2.4vh,27px)]">
              {item.title}
            </h3>
            <p className="mt-2 max-w-[520px] text-sm leading-[1.15] text-text-primary/85 lg:text-[15px]">{item.line}</p>
          </div>
          <div className="relative flex shrink-0 items-center gap-4">
            {cfg.icon && (
              <span className="grid size-10 place-items-center rounded-lg border border-white/[0.08] bg-[#1a1422] text-text-primary/80 transition-all duration-500 group-hover:rotate-[20deg] group-hover:border-primary/50 group-hover:text-primary">
                <Sparkle className="size-4" />
              </span>
            )}
            <ArrowRight className="size-7 transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5 group-hover:text-primary" />
          </div>
        </Link>
      </motion.div>
    </li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

const ABOUT_CAPS: CapConfig = {
  id: "capabilities",
  title: "Capability Without Limits.",
  items: ITEMS,
  image: { src: "/images/about/queen.webp", alt: "Glowing glass queen chess piece — strategy and leadership", aspect: "736 / 994", tint: true },
  sweep: "x",
  icon: true,
};

export default function Capabilities({ config }: { config?: CapConfig } = {}) {
  const cfg = config ?? ABOUT_CAPS;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pin = useScroll({ target: ref, offset: ["start start", "end end"] });
  const flow = useScroll({ target: ref, offset: ["start end", "end 0.6"] });
  const raw = useMotionValue(0);
  const pinnedRef = useRef(pinned);
  useEffect(() => {
    pinnedRef.current = pinned;
    raw.set((pinned ? pin : flow).scrollYProgress.get());
  }, [pinned, raw, pin, flow]);
  useMotionValueEvent(pin.scrollYProgress, "change", (v) => pinnedRef.current && raw.set(v));
  useMotionValueEvent(flow.scrollYProgress, "change", (v) => !pinnedRef.current && raw.set(v));
  const smooth = useSpring(raw, { stiffness: 110, damping: 24, mass: 0.35 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));

  // desktop: queen starts centred & larger, then glides left into its column
  const dx = useMotionValue(0);
  const colRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      const el = colRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      dx.set(window.innerWidth / 2 - (r.left + r.width / 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [dx, pinned]);
  const move = useTransform(progress, [0.12, 0.26], [1, 0], { ease: (t) => 1 - Math.pow(1 - t, 3) });
  const queenX = useTransform(() => (pinned ? move.get() * dx.get() : 0));
  const queenScale = useTransform(() => (pinned ? 1 + move.get() * 0.12 : 1));
  const listOpacity = useTransform(progress, [0.18, 0.26], [0, 1]);
  const titleY = useTransform(progress, [0, 0.1], [40, 0]);
  const titleO = useTransform(progress, [0, 0.08], [0, 1]);
  const titleSpacing = useTransform(progress, [0, 0.12], ["0.15em", "0em"]);
  const counter = useTransform(progress, (v) => {
    const n = [0, 1, 2, 3, 4].filter((i) => v >= cardWindow(i)[1] - 0.02).length;
    return `0${Math.max(1, n)} / 05`;
  });

  return (
    <section
      ref={ref}
      id={cfg.id}
      aria-labelledby={`${cfg.id}-title`}
      className="relative py-24 lg:h-[340vh] lg:py-0"
    >
      <div className="relative lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-[760px] lg:flex-col lg:justify-center lg:overflow-hidden lg:pt-16">
        <motion.h2
          id={`${cfg.id}-title`}
          style={pinned ? { y: titleY, opacity: titleO, letterSpacing: titleSpacing } : undefined}
          initial={pinned ? false : { opacity: 0, y: 40 }}
          whileInView={pinned ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="container-site text-center font-display text-[clamp(2.5rem,3.4vw,4rem)] font-bold leading-tight"
        >
          {cfg.title}
        </motion.h2>

        <div className="container-site mt-14 grid items-center gap-10 lg:mt-[4.5vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-12">
          <div ref={colRef} className="relative mx-auto w-full lg:z-20" style={{ maxWidth: cfg.image.maxWidth ?? "min(420px, 44vh)" }}>
            <motion.div style={{ x: queenX, scale: queenScale }}>
              <QueenCard progress={progress} pinned={pinned} cfg={cfg} />
            </motion.div>
          </div>

          <motion.div style={pinned ? { opacity: listOpacity } : undefined} className="relative z-10">
            {pinned && (
              <motion.p className="mb-4 font-mono text-xs tracking-[0.3em] text-text-primary/50">
                <motion.span>{counter}</motion.span>
              </motion.p>
            )}
            <ul className="flex flex-col gap-4 lg:gap-[2.2vh]">
              {cfg.items.map((item, i) => (
                <Row key={item.no} item={item} i={i} progress={progress} pinned={pinned} cfg={cfg} />
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
