"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { ArrowRight, ChevronDown, Facebook, Instagram, Tiktok, Youtube } from "@/components/ui/icons";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

const SOCIALS = [
  { label: "Instagram", Icon: Instagram, href: siteConfig.socials.instagram },
  { label: "Facebook", Icon: Facebook, href: siteConfig.socials.facebook },
  { label: "TikTok", Icon: Tiktok, href: siteConfig.socials.tiktok },
  { label: "YouTube", Icon: Youtube, href: siteConfig.socials.youtube },
];

const rise: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

/* ───────────────────────── Accordion item ───────────────────────── */

function Item({ item, i, open, onToggle }: { item: { q: string; a: string }; i: number; open: boolean; onToggle: () => void }) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <motion.li variants={rise}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-[18px] border transition-[border-color,box-shadow,background-color] duration-500",
          open
            ? "border-transparent shadow-[0_24px_60px_-30px_rgba(183,43,202,0.8)] [background:linear-gradient(#0f0b14,#0f0b14)_padding-box,linear-gradient(270deg,#E96ED8,#B72BCA_50.12%,#62229D)_border-box]"
            : "border-white/[0.08] bg-[#0f0b14] hover:border-white/20 hover:bg-[#130e19]",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center gap-3 px-4 py-[13px] text-left sm:gap-[13px] sm:pl-[39px] sm:pr-[39px]"
        >
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full font-display text-sm font-medium transition-all duration-500",
              open ? "bg-primary text-ink shadow-[0_0_20px_rgba(233,224,42,0.45)]" : "bg-[#2a2612] text-primary group-hover:bg-[#363017]",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 font-serif text-[clamp(1.05rem,1.25vw,1.4rem)] leading-snug transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
            {item.q}
          </span>
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-500",
              open ? "rotate-180 border-primary/40 bg-white/[0.03] text-primary" : "border-white/[0.06] bg-white/[0.03] text-text-primary group-hover:border-white/20",
            )}
          >
            <ChevronDown className="size-5" />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={id}
              role="region"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <motion.p
                initial={{ y: -8, filter: "blur(4px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                className="max-w-[560px] pb-[14px] pl-[72px] pr-4 text-[15px] leading-[1.3] text-text-primary/85 sm:pl-[96px]"
              >
                {item.a}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* sweep along the bottom when opened */}
        <span aria-hidden className={cn("bg-brand-gradient absolute bottom-0 left-0 h-[2px] w-full origin-left transition-transform duration-700 ease-cinematic", open ? "scale-x-100" : "scale-x-0")} />
      </div>
    </motion.li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function ServiceFaq({ items }: { items: NonNullable<ServicePage["faq"]> }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section aria-labelledby="faq-title" className="relative overflow-hidden py-24 lg:py-[clamp(6rem,10vw,12.5rem)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[35%] h-[70%] w-[90%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(70,18,110,0.45),transparent)]" />

      <motion.h2
        id="faq-title"
        initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1, ease: EASE }}
        className="container-site relative text-center font-display text-[clamp(2.75rem,4.3vw,5.25rem)] font-bold uppercase leading-none"
      >
        FAQ
      </motion.h2>

      <div className="container-site relative mt-14 grid gap-12 lg:mt-[120px] lg:grid-cols-[321px_1fr] lg:gap-[62px]">
        {/* left: logo + socials */}
        <motion.aside
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="order-last lg:order-none lg:sticky lg:top-28 lg:self-start"
        >
          <motion.div variants={rise}>
            <motion.div animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-[215px]">
              <Image src="/images/logo.svg" alt="Hush Lush Technologies" width={215} height={76} className="h-auto w-full" />
            </motion.div>
          </motion.div>

          <motion.ul variants={rise} className="mt-12 flex flex-col gap-2 rounded-[18px] border border-white/[0.08] bg-[#0f0b14] p-6" aria-label="Social media">
            {SOCIALS.map(({ label, Icon, href }) => {
              const inner = (
                <>
                  <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-black/40 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand-gradient group-hover:shadow-[0_0_20px_rgba(233,110,216,0.6)]">
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-lg transition-transform duration-500 ease-cinematic group-hover:translate-x-1">{label}</span>
                  <ArrowRight className="size-4 -translate-x-2 text-grad-start opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl py-5">
                      {inner}
                    </a>
                  ) : (
                    <span className="group flex cursor-default items-center gap-3 rounded-xl py-5">{inner}</span>
                  )}
                </li>
              );
            })}
          </motion.ul>
        </motion.aside>

        {/* right: questions */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
          className="flex flex-col gap-[19px]"
        >
          {items.map((f, i) => (
            <Item key={f.q} item={f} i={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
