"use client";

import { useRef, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/navigation";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

type Data = NonNullable<ServicePage["listings"]>;
type Item = Data["items"][number];

const rise: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

function Check() {
  return (
    <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-[#2a2612] text-primary transition-all duration-300 group-hover/li:bg-primary group-hover/li:text-ink group-hover/li:shadow-[0_0_14px_rgba(233,224,42,0.6)]">
      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, ease: EASE } } }}
        />
      </svg>
    </span>
  );
}

function Row({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const imageLeft = index % 2 === 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  };
  const onLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.article
      ref={ref}
      id={slugify(item.key)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className={cn("grid scroll-mt-28 items-start gap-6 md:gap-[2.9%]", imageLeft ? "md:grid-cols-[45fr_52fr]" : "md:grid-cols-[52fr_45fr]")}
    >
      {item.alias?.map((a) => (
        <span key={a} id={slugify(a)} aria-hidden className="pointer-events-none absolute -mt-28" />
      ))}
      {/* photo */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: imageLeft ? -60 : 60, rotateY: imageLeft ? 18 : -18 },
          show: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 1.1, ease: EASE } },
        }}
        className={cn("[perspective:1200px]", !imageLeft && "md:order-2")}
      >
        <div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ "--mx": "50%", "--my": "50%", "--rx": "0deg", "--ry": "0deg" } as CSSProperties}
          className="group relative aspect-[309/282] overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0f0b14] transition-transform duration-300 ease-out [transform:rotateX(var(--rx))_rotateY(var(--ry))]"
        >
          <motion.div
            style={{ y: imgY }}
            variants={{ hidden: { clipPath: "inset(0% 100% 0% 0%)", scale: 1.25 }, show: { clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { duration: 1.3, ease: EASE, delay: 0.1 } } }}
            className="absolute -inset-y-[10%] inset-x-0"
          >
            <Image src={item.image} alt={`${item.title} by Hush Lush Technologies`} fill sizes="(min-width:768px) 460px, 100vw" className="object-cover transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.07]" />
          </motion.div>
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(300px circle at var(--mx) var(--my), rgba(233,110,216,0.28), transparent 65%)" }} />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_120%,rgba(102,34,159,0.5),transparent_60%)]" />
        </div>
      </motion.div>

      {/* card + checklist */}
      <div className={cn(!imageLeft && "md:order-1")}>
        <motion.div
          variants={rise}
          className="group relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0f0b14] px-4 pb-4 pt-[18px] transition-[border-color,box-shadow] duration-500 hover:border-transparent hover:shadow-[0_24px_60px_-30px_rgba(183,43,202,0.8)] hover:[background:linear-gradient(#0f0b14,#0f0b14)_padding-box,linear-gradient(270deg,#E96ED8,#B72BCA_50.12%,#62229D)_border-box]"
        >
          <p className="font-display text-base font-medium text-primary">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 font-display text-[clamp(1.5rem,1.6vw,1.9rem)] font-medium leading-tight">{item.title}</h3>
          <p className="mt-4 text-[15px] leading-[1.1] text-text-primary/85">{item.text}</p>
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(233,110,216,0.12),transparent)] motion-safe:animate-[sweep_6s_ease-in-out_infinite]" style={{ animationDelay: `${index * 1.3}s` }} />
        </motion.div>

        <motion.ul
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } } }}
          className="mt-6 grid grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-flow-col sm:grid-cols-2"
          style={{ gridTemplateRows: `repeat(${Math.ceil(item.list.length / 2)}, auto)` }}
          aria-label={`${item.title} services`}
        >
          {item.list.map((li) => (
            <motion.li
              key={li}
              variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="group/li flex items-center gap-3 font-display text-[15px] font-medium transition-transform duration-300 hover:translate-x-1"
            >
              <Check />
              {li}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.article>
  );
}

function Banner({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const enter = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const clip = useTransform(enter, (v) => (reduce ? "inset(0% 0% 0% 0% round 48px)" : `inset(${(1 - v) * 12}% ${(1 - v) * 18}% ${(1 - v) * 12}% ${(1 - v) * 18}% round 48px)`));
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.3, 1.05, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  return (
    <div ref={ref} className="mx-auto mt-[clamp(4rem,9vw,10rem)] w-full max-w-[1280px]">
      <motion.div style={{ clipPath: clip }} className="group relative aspect-[1031/524] overflow-hidden rounded-[clamp(24px,3vw,48px)] bg-[#0f0b14]">
        <motion.div style={{ scale, y }} className="absolute -inset-y-[8%] inset-x-0">
          <Image src={src} alt={alt} fill sizes="(min-width:1280px) 1280px, 100vw" className="object-cover" />
        </motion.div>
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_120%,rgba(102,34,159,0.45),transparent_60%)]" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] motion-safe:animate-[sweep_7s_ease-in-out_infinite]" />
      </motion.div>
    </div>
  );
}

export default function ServiceListings({ data }: { data: Data }) {
  return (
    <section aria-labelledby="listings-title" className="relative overflow-hidden pb-10 pt-24 lg:pt-[clamp(6rem,10vw,12rem)]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[40%] h-[60%] w-[80%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(70,18,110,0.3),transparent)]" />
      <motion.h2
        id="listings-title"
        initial={{ opacity: 0, y: 40, letterSpacing: "0.12em", filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "0em", filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="container-site relative text-center font-display text-[clamp(2.2rem,4.2vw,5rem)] font-bold leading-[1.05]"
      >
        {data.title}
      </motion.h2>

      <div className="container-site relative">
        <div className="mx-auto mt-14 flex max-w-[1024px] flex-col gap-16 lg:mt-[clamp(4rem,8vw,9.5rem)] lg:gap-[clamp(3.5rem,4.5vw,5.5rem)]">
          {data.items.map((item, i) => (
            <Row key={item.key} item={item} index={i} />
          ))}
        </div>
        {data.banner && <Banner {...data.banner} />}
      </div>
    </section>
  );
}
