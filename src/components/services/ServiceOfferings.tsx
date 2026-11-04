"use client";

import { useRef, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { slugify } from "@/lib/navigation";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

type Item = NonNullable<ServicePage["offerings"]>["items"][number];

function OfferCard({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();

  // image drifts inside its frame while the card crosses the screen
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  const col = index % 3;

  return (
    <motion.article
      ref={ref}
      id={slugify(item.key)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: { opacity: 0, y: 80, rotateX: -18, filter: "blur(8px)" },
        show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE, delay: col * 0.12 } },
      }}
      style={{ "--mx": "50%", "--my": "50%", "--rx": "0deg", "--ry": "0deg" } as CSSProperties}
      className="group scroll-mt-28 [perspective:1200px]"
    >
      <div className="transition-transform duration-300 ease-out [transform:rotateX(var(--rx))_rotateY(var(--ry))] [transform-style:preserve-3d]">
        {/* image card */}
        <div className="relative aspect-[416/248] overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0f0b14]">
          <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
            {/* reveal wipe */}
            <motion.div
              className="absolute inset-0"
              variants={{
                hidden: { clipPath: "inset(0% 0% 100% 0%)", scale: 1.25 },
                show: { clipPath: "inset(0% 0% 0% 0%)", scale: 1, transition: { duration: 1.3, ease: EASE, delay: 0.15 + col * 0.12 } },
              }}
            >
              <Image
                src={item.image}
                alt={`${item.title} by Hush Lush Technologies`}
                fill
                sizes="(min-width:1024px) 416px, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.08]"
              />
            </motion.div>
          </motion.div>
          {/* cursor light + purple grade on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(320px circle at var(--mx) var(--my), rgba(233,110,216,0.28), transparent 65%)" }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-t from-[#0b0710]/60 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-30" />
        </div>

        {/* info card */}
        <div className="relative mt-4 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0f0b14] px-4 pb-6 pt-5 transition-[border-color,box-shadow] duration-500 group-hover:border-transparent group-hover:shadow-[0_24px_60px_-30px_rgba(183,43,202,0.8)] group-hover:[background:linear-gradient(#0f0b14,#0f0b14)_padding-box,linear-gradient(270deg,#E96ED8,#B72BCA_50.12%,#62229D)_border-box]">
          <p className="font-display text-base font-medium text-primary">
            <span className="inline-block transition-transform duration-500 ease-cinematic group-hover:-translate-y-0.5">{String(index + 1).padStart(2, "0")}</span>
          </p>
          <h3 className="mt-1 font-display text-[clamp(1.4rem,1.5vw,1.75rem)] font-medium leading-tight transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
            {item.title}
          </h3>
          <p className="mt-3 text-[15px] leading-[1.1] text-text-primary/85">{item.text}</p>
          {/* sweep line */}
          <span aria-hidden className="bg-brand-gradient absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-700 ease-cinematic group-hover:scale-x-100" />
        </div>
      </div>
    </motion.article>
  );
}

export default function ServiceOfferings({ data }: { data: NonNullable<ServicePage["offerings"]> }) {
  return (
    <section aria-labelledby="offerings-title" className="relative overflow-hidden py-24 lg:py-[clamp(6rem,12vw,14rem)]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[40%] h-[60%] w-[80%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(70,18,110,0.25),transparent)]" />

      <motion.h2
        id="offerings-title"
        initial={{ opacity: 0, y: 40, letterSpacing: "0.12em", filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "0em", filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="container-site relative text-center font-display text-[clamp(2.4rem,4.2vw,5rem)] font-bold leading-[1.05]"
      >
        {data.title}
      </motion.h2>

      <div className="container-site relative mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:mt-[clamp(5rem,9vw,11rem)] lg:grid-cols-3">
        {data.items.map((item, i) => (
          <OfferCard key={item.key} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
