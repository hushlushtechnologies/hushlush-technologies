"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BentoCard, EASE, Eyebrow, titleClass } from "./shared";

/* ───────────────────────── Growth ───────────────────────── */

export function GrowthCard({ className }: { className?: string }) {
  const bars = [38, 55, 47, 70, 62, 88];
  return (
    <BentoCard className={className} tilt={6} depth={50} phase={4.4}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_80%_at_20%_100%,rgba(30,40,90,0.45),transparent_70%),#0b0810]"
      />
      <div className="relative z-10 flex h-full min-h-[186px] flex-col justify-between p-6 lg:p-[30px]">
        <h3 className={cn(titleClass, "max-w-[300px] text-xl lg:text-[22px]")}>
          Tech enthusiast with a passion for development.
        </h3>
        <Eyebrow>Growth</Eyebrow>
      </div>

      {/* Mini dashboard */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
        className="absolute bottom-[-12px] right-[18px] z-10 h-[96px] w-[50%] max-w-[190px] rounded-t-2xl border border-white/10 bg-[#170f22]/90 p-3 backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <span className="size-2.5 animate-pulse rounded-full bg-primary/80" />
          <motion.span
            className="h-1.5 rounded-full bg-white/25"
            initial={{ width: 0 }}
            whileInView={{ width: 36 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />
        </div>
        <div className="mt-3 flex h-[44px] items-end gap-1.5">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="w-full rounded-sm bg-gradient-to-t from-grad-end to-grad-start"
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.9 + i * 0.08, ease: EASE }}
            />
          ))}
        </div>
      </motion.div>
    </BentoCard>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

export function CtaCard({ className }: { className?: string }) {
  return (
    <BentoCard className={className} tilt={6} depth={70} phase={5.2}>
      <div aria-hidden className="absolute inset-0 bg-[#0b0810]" />
      <motion.div
        aria-hidden
        className="absolute -bottom-1/2 -left-1/4 h-[130%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(98,34,157,0.85),rgba(233,110,216,0.25)_60%,transparent)] blur-2xl"
        animate={{ x: [0, 30, 0], y: [0, -15, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex h-full min-h-[186px] flex-col items-center justify-center gap-4 p-6 text-center">
        <h3 className={cn(titleClass, "max-w-[290px] text-xl lg:text-[23px]")}>
          Do you want to start a project together?
        </h3>
        <Link
          href="/contact"
          className="group/btn relative inline-flex h-[42px] items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-[#1a1226]/90 px-4 text-sm transition-colors duration-300 hover:border-grad-mid/60"
        >
          <span className="bg-brand-gradient absolute inset-0 translate-y-full transition-transform duration-500 ease-cinematic group-hover/btn:translate-y-0" />
          <svg
            viewBox="0 0 24 24"
            className="relative size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden
          >
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
          <span className="relative">Start the Project</span>
        </Link>
      </div>
    </BentoCard>
  );
}
