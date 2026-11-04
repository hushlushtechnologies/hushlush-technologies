"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/navigation";
import { ArrowRight } from "@/components/ui/icons";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

type Data = NonNullable<ServicePage["details"]>;
type Item = Data["items"][number];

/* ───────────────────────── Pieces ───────────────────────── */

const fade: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

function Cta({ cta }: { cta: Data["cta"] }) {
  return (
    <motion.div variants={fade} className="shrink-0">
      <Link
        href={cta.href}
        className="group inline-flex h-[49px] items-center gap-8 rounded-full border border-white/10 bg-[#0f0b14]/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-grad-mid/50 hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.7)]"
      >
        {cta.label}
        <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
          <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function Title({ text, className }: { text: string; className?: string }) {
  return (
    <h3 className={cn("font-display text-[clamp(2.1rem,4.1vw,4.9rem)] font-bold uppercase leading-[1.02] tracking-[-0.01em]", className)}>
      {text.split(" ").map((w, i, arr) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-top">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1, ease: EASE, delay: i * 0.08 } } }}
          >
            {w}
            {i < arr.length - 1 && "\u00a0"}
          </motion.span>
        </span>
      ))}
    </h3>
  );
}

/** Photo with a 3D tip-in, wipe reveal, inner parallax and hover zoom */
function Photo({ src, alt, className, sizes }: { src: string; alt: string; className?: string; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const enter = useSpring(useTransform(scrollYProgress, [0, 0.4], [0, 1]), { stiffness: 80, damping: 20 });
  const rotateX = useTransform(enter, [0, 1], reduce ? [0, 0] : [16, 0]);
  const scale = useTransform(enter, [0, 1], reduce ? [1, 1] : [0.9, 1]);
  const clip = useTransform(enter, (v) => (reduce ? "inset(0% 0% 0% 0% round 44px)" : `inset(${(1 - v) * 14}% ${(1 - v) * 8}% ${(1 - v) * 14}% ${(1 - v) * 8}% round 44px)`));
  const innerY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <div ref={ref} className={cn("[perspective:1400px]", className)}>
      <motion.div style={{ rotateX, scale, clipPath: clip }} className="group relative aspect-[908/445] overflow-hidden rounded-[clamp(24px,2.3vw,44px)] bg-[#0f0b14] [.split_&]:aspect-[528/445]">
        <motion.div style={{ y: innerY }} className="absolute -inset-y-[8%] inset-x-0">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-[1.4s] ease-cinematic group-hover:scale-[1.06]" />
        </motion.div>
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(102,34,159,0.45),transparent_60%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] transition-[left] duration-[1.2s] ease-cinematic group-hover:left-[130%]" />
      </motion.div>
    </div>
  );
}

function Example({ text, side }: { text: string; side: "left" | "right" }) {
  const line = (
    <motion.span
      aria-hidden
      variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: EASE, delay: 0.2 } } }}
      className={cn("bg-brand-gradient hidden h-1 w-[19.6%] shrink-0 rounded-full shadow-[0_0_14px_rgba(233,110,216,0.6)] sm:block", side === "left" ? "origin-right" : "origin-left")}
    />
  );
  return (
    <motion.div variants={fade} className={cn("mt-[clamp(1.5rem,2.6vw,2.6rem)] flex items-center gap-[4.5%]", side === "right" && "flex-row-reverse")}>
      <p className={cn("text-[clamp(1rem,1.18vw,1.4rem)] leading-[1.05] text-text-primary/90", side === "left" ? "sm:max-w-[75%]" : "sm:max-w-[76%]")}>{text}</p>
      {side === "left" && <span className="hidden flex-1 sm:block" />}
      {line}
    </motion.div>
  );
}

function Divider() {
  return (
    <motion.div
      aria-hidden
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 1 }}
      className="relative mx-auto my-[clamp(4rem,7vw,8.5rem)] flex w-[80.5%] items-center"
    >
      <Spark />
      <motion.span
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, ease: EASE } } }}
        className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.18),rgba(183,43,202,0.25),rgba(255,255,255,0.18))]"
      />
      <Spark />
    </motion.div>
  );
}

function Spark() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="size-6 shrink-0 text-white/70"
      variants={{ hidden: { scale: 0, rotate: -90 }, show: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 12, delay: 0.3 } } }}
    >
      <path d="M12 0 L13 11 L24 12 L13 13 L12 24 L11 13 L0 12 L11 11 Z" fill="currentColor" className="motion-safe:animate-[pulse_3s_ease-in-out_infinite]" />
    </motion.svg>
  );
}

/* ───────────────────────── One showcase ───────────────────────── */

function Block({ item, cta }: { item: Item; cta: Data["cta"] }) {
  const id = slugify(item.key);
  const alt = `${item.title} by Hush Lush Technologies`;
  const common = { id, initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 }, variants: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } } } as const;

  if (item.layout === "wide") {
    return (
      <motion.article {...common} className="scroll-mt-28">
        <div className={cn("flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between", item.reverse && "sm:flex-row-reverse")}>
          <Title text={item.title} className={cn(item.reverse && "sm:text-right")} />
          <Cta cta={cta} />
        </div>
        <motion.p variants={fade} className={cn("mt-[clamp(1.5rem,4vw,5rem)] max-w-[860px] text-[clamp(1.15rem,1.65vw,1.95rem)] leading-[1.05]", item.indent && "sm:ml-[24.1%]")}>
          {item.text}
        </motion.p>
        <Photo src={item.image} alt={alt} sizes="(min-width:1024px) 1024px, 100vw" className="mx-auto mt-[clamp(2rem,4.5vw,5.5rem)] w-full sm:w-[80%]" />
        <Example text={item.example} side={item.exampleSide ?? "left"} />
      </motion.article>
    );
  }

  const imageRight = item.layout === "left";
  return (
    <motion.article {...common} className="split scroll-mt-28">
      <div className={cn("grid items-center gap-8 lg:grid-cols-2 lg:gap-[6%]", !imageRight && "lg:[&>*:first-child]:order-2")}>
        <div>
          <Title text={item.title} />
          <motion.p variants={fade} className="mt-[clamp(1.25rem,2.2vw,2.75rem)] max-w-[540px] text-[clamp(1.15rem,1.65vw,1.95rem)] leading-[1.05]">
            {item.text}
          </motion.p>
          <div className="mt-[clamp(1.5rem,2.3vw,2.75rem)]">
            <Cta cta={cta} />
          </div>
        </div>
        <Photo src={item.image} alt={alt} sizes="(min-width:1024px) 600px, 100vw" />
      </div>
      <Example text={item.example} side={imageRight ? "right" : "left"} />
    </motion.article>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function ServiceDetails({ data }: { data: Data }) {
  return (
    <section aria-label="Our branding services in detail" className="relative py-24 lg:py-[clamp(6rem,9vw,11rem)]">
      <div className="container-site">
        {data.items.map((item, i) => (
          <div key={item.key}>
            {i > 0 && <Divider />}
            <Block item={item} cta={data.cta} />
          </div>
        ))}
        <Divider />
      </div>
    </section>
  );
}
