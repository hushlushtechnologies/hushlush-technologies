"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkle } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD_W = 312;
const GAP = 29;

/* ───────────────────────── Content ───────────────────────── */

type Card = {
  title: string;
  href: string;
  tone: "light" | "violet" | "dark" | "indigo";
  image: string;
  imageAlt: string;
  /** Illustration box inside the 312×329 card */
  imageClass: string;
  effect: "none" | "beam" | "pings" | "waves";
  chips: string[][];
};

const CARDS: Card[] = [
  {
    title: "Brand",
    href: "/services/branding-and-identity",
    tone: "light",
    image: "/images/ecosystem/brand.webp",
    imageAlt: "People building a brand from letter blocks",
    imageClass: "left-[6.7%] top-[10.6%] w-[89.7%] h-[83.6%]",
    effect: "none",
    chips: [["Branding"], ["Strategy & Consulting"], ["PR & Communication"]],
  },
  {
    title: "Create",
    href: "/services/production-service",
    tone: "violet",
    image: "/images/ecosystem/create.webp",
    imageAlt: "Vintage film projector casting a purple light beam",
    imageClass: "left-[4.2%] top-[26.7%] w-[96.2%] h-[68.4%]",
    effect: "beam",
    chips: [["Photography"], ["Video Production", "Studio"], ["Design", "Outdoor"]],
  },
  {
    title: "Digital",
    href: "/services/software-solution",
    tone: "dark",
    image: "/images/ecosystem/digital.webp",
    imageAlt: "Smartphone surrounded by floating app interface cards",
    imageClass: "left-[14.4%] top-[32.5%] w-[86.5%] h-[66.3%]",
    effect: "pings",
    chips: [["Web Development", "UI/UX"], ["Mobile Apps", "E-commerce"], ["SaaS Application"]],
  },
  {
    title: "Grow",
    href: "/services/digital-marketing",
    tone: "indigo",
    image: "/images/ecosystem/grow.webp",
    imageAlt: "Glossy purple megaphone",
    imageClass: "left-[-12.8%] top-[13.4%] w-[131%] h-[95.1%]",
    effect: "waves",
    chips: [["Paid Advertising"], ["Corporate Design"], ["Production", "Campaign"]],
  },
];

const TONES: Record<Card["tone"], { card: string; title: string; chip: string; star: string }> = {
  light: {
    card: "bg-card",
    title: "text-purple",
    chip: "bg-[#fde8d3] text-ink border-transparent",
    star: "text-ink",
  },
  violet: {
    card: "bg-[linear-gradient(180deg,#1c0a2c_0%,#2c0d4b_45%,#5d1f9e_100%)] border border-white/[0.06]",
    title: "text-primary",
    chip: "bg-[#20132e]/80 text-text-primary border-white/10",
    star: "text-text-primary",
  },
  dark: {
    card: "bg-[#0d0a12] border border-white/[0.08]",
    title: "text-primary",
    chip: "bg-[#15101d]/85 text-text-primary border-white/10",
    star: "text-text-primary",
  },
  indigo: {
    card: "bg-[linear-gradient(170deg,#140f33_0%,#2a1460_50%,#5a24a6_100%)] border border-white/[0.06]",
    title: "text-primary",
    chip: "bg-[#1b1236]/80 text-text-primary border-white/10",
    star: "text-text-primary",
  },
};

/* ───────────────────────── Card ───────────────────────── */

function Effect({ kind }: { kind: Card["effect"] }) {
  if (kind === "beam")
    return (
      <motion.div
        aria-hidden
        className="absolute left-[49%] right-0 top-[46%] h-[16%] origin-left bg-[linear-gradient(90deg,rgba(255,220,255,0.9),rgba(233,110,216,0.45)_40%,transparent)] mix-blend-screen blur-md [clip-path:polygon(0_45%,100%_0,100%_100%,0_55%)]"
        animate={{ opacity: [0.55, 0.9, 0.6, 1, 0.55], scaleX: [0.96, 1, 0.98, 1, 0.96] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  if (kind === "waves")
    return (
      <div aria-hidden className="absolute left-[44%] top-[56%] size-0">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-grad-start/60"
            initial={{ width: 20, height: 20, opacity: 0 }}
            animate={{ width: [20, 160], height: [20, 160], opacity: [0.8, 0] }}
            transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </div>
    );
  if (kind === "pings")
    return (
      <div aria-hidden className="absolute inset-0">
        {[
          { l: "28%", t: "36%", d: 0 },
          { l: "78%", t: "44%", d: 1.1 },
          { l: "62%", t: "30%", d: 2.2 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute size-2.5 rounded-full bg-grad-start shadow-[0_0_14px_#e96ed8]"
            style={{ left: p.l, top: p.t }}
            animate={{ scale: [0, 1.2, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.4, delay: p.d, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}
      </div>
    );
  return null;
}

const cardVariant: Variants = {
  hidden: { opacity: 0, x: 120, rotateY: -18, filter: "blur(10px)" },
  show: { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
};

function EcoCard({ card, index }: { card: Card; index: number }) {
  const t = TONES[card.tone];
  return (
    <motion.li variants={cardVariant} className="shrink-0 [perspective:1000px]" style={{ width: "var(--card-w)" }}>
      <Link
        href={card.href}
        draggable={false}
        aria-label={`${card.title}: ${card.chips.flat().join(", ")}`}
        className={cn(
          "group relative block h-[329px] overflow-hidden rounded-[24px] transition-[transform,box-shadow] duration-500 ease-cinematic hover:-translate-y-2 hover:shadow-[0_30px_80px_-25px_rgba(183,43,202,0.65)]",
          t.card
        )}
      >
        {/* Illustration: soft & dreamy at rest, sharpens and grows on hover */}
        <div className={cn("pointer-events-none absolute", card.imageClass)}>
          <div className="relative size-full animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none" style={{ animationDelay: `${index * -1.6}s` }}>
            <Image
              src={card.image}
              alt={card.imageAlt}
              fill
              sizes="312px"
              draggable={false}
              className="object-contain opacity-80 blur-[2px] transition-[filter,opacity,transform] duration-700 ease-cinematic group-hover:scale-105 group-hover:opacity-100 group-hover:blur-0"
            />
          </div>
        </div>
        <Effect kind={card.effect} />

        <h3 className={cn("relative pt-[46px] text-center font-display text-[32px] font-bold uppercase leading-none", t.title)}>
          {card.title}
        </h3>
        <Sparkle
          className={cn(
            "relative mx-auto mt-[34px] size-6 animate-[spin_9s_linear_infinite] transition-transform duration-500 group-hover:scale-125 motion-reduce:animate-none",
            t.star
          )}
        />

        {/* Chips */}
        <div className="absolute inset-x-[14px] bottom-[32px] flex flex-col items-start gap-[8px]">
          {card.chips.map((row, r) => (
            <div key={r} className="flex flex-wrap gap-[6px]">
              {row.map((chip, c) => (
                <span
                  key={chip}
                  className={cn(
                    "rounded-lg border px-3.5 py-[6px] text-base leading-tight backdrop-blur-[2px] transition-transform duration-500 ease-cinematic group-hover:translate-x-1",
                    t.chip
                  )}
                  style={{ transitionDelay: `${(r * 2 + c) * 40}ms` }}
                >
                  {chip}
                </span>
              ))}
            </div>
          ))}
        </div>
      </Link>
    </motion.li>
  );
}

/* ───────────────────────── Scroll-revealed headline ───────────────────────── */

const HEADLINE: { w: string; hl?: boolean }[] = (
  "From |Strategy| And |Creative| To Technology And Growth, We Bring Every Capability Together To |Build Brands| That Move Forward."
)
  .split("|")
  .flatMap((part, i) => part.trim().split(" ").filter(Boolean).map((w) => ({ w, hl: i % 2 === 1 })));

function Word({ word, i, n, progress }: { word: { w: string; hl?: boolean }; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={word.hl ? "text-primary" : undefined}>
      {word.w}{" "}
    </motion.span>
  );
}

function RevealHeadline() {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const progress = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  return (
    <h2
      ref={ref}
      id="ecosystem-title"
      className="text-[clamp(1.75rem,2.4vw+0.5rem,2.75rem)] leading-[1.06] tracking-[-0.01em] text-text-primary"
    >
      {HEADLINE.map((word, i) => (
        <Word key={i} word={word} i={i} n={HEADLINE.length} progress={progress} />
      ))}
    </h2>
  );
}

/* ───────────────────────── Slider ───────────────────────── */

function useSlider(count: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [pos, setPos] = useState<"start" | "middle" | "end">("start");

  useEffect(() => {
    const measure = () => {
      if (!viewportRef.current || !trackRef.current) return;
      const max = Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth + 40);
      setMaxDrag(max);
      if (x.get() < -max) x.set(-max);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [count, x]);

  useEffect(
    () =>
      x.on("change", (v) => {
        setPos(v > -4 ? "start" : v < -maxDrag + 4 ? "end" : "middle");
      }),
    [x, maxDrag]
  );

  const step = (dir: 1 | -1) => {
    const w = trackRef.current?.firstElementChild?.getBoundingClientRect().width ?? CARD_W;
    const target = Math.min(0, Math.max(-maxDrag, x.get() - dir * (w + GAP)));
    animate(x, target, { type: "spring", stiffness: 140, damping: 22 });
  };

  return { viewportRef, trackRef, x, maxDrag, pos, step };
}

/* ───────────────────────── Section ───────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

export default function Ecosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { viewportRef, trackRef, x, maxDrag, pos, step } = useSlider(CARDS.length);

  // Scroll: the whole card row glides left as the section passes
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -40]);

  return (
    <section
      ref={sectionRef}
      id="ecosystem"
      aria-labelledby="ecosystem-title"
      className="relative overflow-hidden py-24 lg:py-[160px]"
    >
      <div className="container-site">
        {/* Top: intro + headline */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[309px_minmax(0,1fr)] lg:gap-0">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15%" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
            className="order-2 lg:order-1 lg:pt-[35px]"
          >
            <motion.p variants={fadeUp} className="text-body max-w-[200px] text-text-primary/90">
              From Brand Strategy To Digital Products, We Bring Creative, Technology And Growth Capabilities Together Under One Roof.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-[73px] hidden lg:block">
              <Link
                href="#services"
                className="group inline-flex h-[49px] w-fit items-center gap-10 rounded-full border border-white/10 bg-surface/80 pl-6 pr-[5px] text-base font-medium transition-colors duration-300 hover:border-grad-mid/50"
              >
                Explore Our Service
                <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                  <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
          <div className="order-1 lg:order-2">
            <RevealHeadline />
          </div>
        </div>

        {/* Bottom: controls + slider */}
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-[195px] lg:grid-cols-[309px_minmax(0,1fr)] lg:items-end lg:gap-0">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="order-2 flex items-center justify-between lg:order-1 lg:block"
          >
            <p className="font-display text-[15px] font-bold uppercase leading-[1.3]">
              One Ecosystem.
              <br />
              Endless Possibilities.
            </p>
            <div className="flex gap-4 lg:mt-5">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={pos === "start"}
                aria-label="Previous"
                className="grid size-14 place-items-center rounded-[14px] border border-white/[0.08] bg-surface text-primary transition-all duration-300 hover:border-primary/50 disabled:opacity-40 lg:size-[75px]"
              >
                <ArrowRight className="size-6 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={pos === "end" || maxDrag === 0}
                aria-label="Next"
                className="grid size-14 place-items-center rounded-[14px] bg-card text-purple transition-all duration-300 hover:shadow-[0_0_30px_rgba(233,110,216,0.5)] disabled:opacity-40 lg:size-[75px]"
              >
                <ArrowRight className="size-6" />
              </button>
            </div>
          </motion.div>

          {/* Slider viewport bleeds to the right edge of the screen */}
          <div
            ref={viewportRef}
            style={{ "--card-w": `min(${CARD_W}px, 78vw)` } as React.CSSProperties}
            className="order-1 -mr-[clamp(1.25rem,5.5vw,5rem)] lg:order-2 lg:mr-[calc(50%-50vw)]">
            <motion.div style={{ x: drift }}>
              <motion.ul
                ref={trackRef}
                drag={maxDrag > 0 ? "x" : false}
                dragConstraints={{ left: -maxDrag, right: 0 }}
                dragElastic={0.12}
                style={{ x }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10%" }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
                className="flex w-max cursor-grab gap-[29px] pr-10 active:cursor-grabbing"
              >
                {CARDS.map((card, i) => (
                  <EcoCard key={card.title} card={card} index={i} />
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
