"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export type LegalSection = { id: string; nav: string; title: string; body: ReactNode };

export default function LegalDoc({
  tag,
  title,
  intro,
  updated,
  sections,
  outro,
}: {
  tag: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  outro?: ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // highlight the section currently being read
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <>
      {/* reading progress */}
      <motion.div aria-hidden style={{ scaleX: bar }} className="bg-brand-gradient fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" />

      <section className="relative overflow-hidden pb-14 pt-[clamp(8rem,12vw,13rem)] text-center">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[70%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(102,34,159,0.35),transparent)]" />
        <div className="container-site relative">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2 font-display text-sm font-medium text-primary"
          >
            {tag}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-5 font-display text-[clamp(2.25rem,3vw,3.25rem)] font-bold leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
            className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed text-text-primary/85"
          >
            {intro}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-5 text-base text-text-primary/50">
            Last Updated: {updated}
          </motion.p>
        </div>
      </section>

      <section className="container-site grid gap-10 pb-28 lg:grid-cols-[410px_1fr] lg:gap-[46px]">
        {/* contents */}
        <motion.nav
          aria-label="Contents"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="h-fit overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0f0b14] lg:sticky lg:top-28"
        >
          <p className="px-[60px] pb-6 pt-10 font-display text-2xl font-medium max-lg:px-6">Contents</p>
          <ul className="pb-7">
            {sections.map((s) => (
              <li key={s.id} className="border-t border-white/[0.05]">
                <a
                  href={`#${s.id}`}
                  className={cn(
                    "relative block px-[60px] py-[18px] text-lg transition-colors duration-300 max-lg:px-6",
                    active === s.id ? "bg-white/[0.04] text-[#9bb8ff]" : "text-text-primary/90 hover:bg-white/[0.02] hover:text-text-primary",
                  )}
                >
                  {active === s.id && (
                    <motion.span layoutId="legal-active" className="bg-brand-gradient absolute inset-y-0 left-0 w-[3px]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  {s.nav}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* body */}
        <article className="legal max-w-[760px] pt-2">
          {sections.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="scroll-mt-28 pb-12"
            >
              <h2 className="font-display text-[22px] font-bold">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-1 space-y-5 text-[15px] leading-[1.6] text-text-primary/90 [&_a]:text-[#9bb8ff] [&_a]:underline-offset-4 hover:[&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
                {s.body}
              </div>
            </motion.section>
          ))}
          {outro && (
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }} className="space-y-5 text-[15px] leading-[1.6] text-text-primary/90">
              {outro}
            </motion.div>
          )}
        </article>
      </section>
    </>
  );
}
