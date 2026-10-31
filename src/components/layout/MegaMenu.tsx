"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { serviceCategories, serviceHref } from "@/lib/navigation";
import { Send } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const panel: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.985, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.04, delayChildren: 0.08 },
  },
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.25, ease: EASE } },
};

const column: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type Props = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
};

function Category({ index, onNavigate }: { index: number; onNavigate: () => void }) {
  const cat = serviceCategories[index];
  return (
    <motion.div variants={column}>
      <Link
        href={serviceHref(cat.title)}
        onClick={onNavigate}
        className="font-display text-[15px] uppercase tracking-wide text-text-primary/45 transition-colors hover:text-text-primary/80"
      >
        {cat.title}
      </Link>
      <ul className="mt-6 space-y-3.5">
        {cat.items.map((item) => (
          <li key={item}>
            <Link
              href={serviceHref(cat.title, item)}
              onClick={onNavigate}
              className="group inline-flex items-center text-sm leading-tight text-text-primary/90 transition-colors hover:text-text-primary"
            >
              <span className="bg-brand-gradient mr-0 h-px w-0 transition-all duration-300 ease-cinematic group-hover:mr-2 group-hover:w-3" />
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function MegaMenu({ onMouseEnter, onMouseLeave, onNavigate }: Props) {
  return (
    <motion.div
      id="mega-menu"
      variants={panel}
      initial="hidden"
      animate="show"
      exit="exit"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="container-site absolute inset-x-0 top-full hidden lg:block"
    >
      <div className="max-h-[calc(100dvh-110px)] overflow-y-auto rounded-[28px] border border-white/[0.06] bg-panel p-8 xl:p-10 shadow-[0_40px_120px_-20px_rgba(102,34,159,0.45)] backdrop-blur-2xl">
        <div className="grid grid-cols-4 gap-x-10 gap-y-10 xl:gap-y-12">
          {[0, 1, 2].map((i) => (
            <Category key={i} index={i} onNavigate={onNavigate} />
          ))}

          {/* CTA card */}
          <motion.div
            variants={column}
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/10 px-6 py-9 text-center"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 100%, #62229d 0%, #2a0f45 55%, #140a1f 100%)",
            }}
          >
            <p className="font-display text-lg font-bold uppercase text-primary">Talk To Our Team</p>
            <p className="mt-3 text-sm leading-snug text-text-primary/90">
              Bring It To Us. We&apos;ll Turn It Into Something Worth Remembering.
            </p>
            <Link
              href="/contact"
              onClick={onNavigate}
              className="bg-brand-gradient mt-7 inline-flex h-9 items-center gap-2.5 rounded-full px-5 text-xs font-semibold transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(233,110,216,0.6)]"
            >
              Start The Project
              <Send className="size-4" />
            </Link>
          </motion.div>

          {[3, 4, 5, 6].map((i) => (
            <Category key={i} index={i} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
