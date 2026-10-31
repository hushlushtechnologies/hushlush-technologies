"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  BentoCard,
  Chip,
  EASE,
  Eyebrow,
  Floaty,
  Kicker,
  ParallaxLayer,
  titleClass,
} from "./shared";

const CHIPS = [
  { label: "Bold", className: "left-[7%] top-[62%]", delay: 0.5 },
  { label: "Original", className: "left-[43%] top-[79%]", delay: 0.65 },
  { label: "Unforgettable", className: "right-[6%] top-[56%]", delay: 0.8 },
];

export default function CreativityCard({ className }: { className?: string }) {
  return (
    <BentoCard className={className} depth={60} phase={1.7}>
      {/* Flowing purple silk */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(160deg,#0b0810_25%,#1a0830_60%,#2b0b4d_100%)]"
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-[45%] right-[-25%] h-[110%] w-[95%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(150,70,240,0.75),rgba(98,34,157,0.35)_55%,transparent)] blur-2xl"
        animate={{ x: [0, -40, 0], y: [0, -18, 0], rotate: [-8, 4, -8] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        aria-hidden
        viewBox="0 0 538 264"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={i}
            fill="none"
            stroke="url(#silk)"
            strokeWidth={1.2}
            strokeOpacity={0.55 - i * 0.08}
            animate={{
              d: [
                `M150 ${300 - i * 9} C 280 ${250 - i * 12}, 380 ${215 - i * 10}, 560 ${150 - i * 14}`,
                `M150 ${300 - i * 9} C 290 ${232 - i * 12}, 400 ${238 - i * 10}, 560 ${132 - i * 14}`,
                `M150 ${300 - i * 9} C 280 ${250 - i * 12}, 380 ${215 - i * 10}, 560 ${150 - i * 14}`,
              ],
            }}
            transition={{
              duration: 7 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <defs>
          <linearGradient
            id="silk"
            x1="150"
            y1="300"
            x2="560"
            y2="140"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e96ed8" stopOpacity="0" />
            <stop offset="0.6" stopColor="#c48cff" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
      {/* Light sweep */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        animate={{ left: ["-40%", "140%"] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex h-full min-h-[264px] flex-col p-7 lg:px-[37px] lg:pt-[46px]">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn(titleClass, "text-[26px] lg:text-[32px]")}>
            Creativity
            <br />
            Without Limits.
          </h3>
          <Eyebrow className="pt-1">Creativity</Eyebrow>
        </div>
        <Kicker className="mt-2">Make Them Look Twice</Kicker>
      </div>

      {CHIPS.map((c, i) => (
        <motion.div
          key={c.label}
          className={cn("absolute z-10", c.className)}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: c.delay, ease: EASE }}
        >
          <ParallaxLayer amount={[16, 28, 22][i]}>
            <Floaty delay={i * 0.8} distance={6} duration={4.5 + i}>
              <motion.div whileHover={{ scale: 1.1, rotate: -3 }}>
                <Chip>{c.label}</Chip>
              </motion.div>
            </Floaty>
          </ParallaxLayer>
        </motion.div>
      ))}
    </BentoCard>
  );
}
