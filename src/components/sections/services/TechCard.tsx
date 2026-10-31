"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
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

type Token = [text: string, color: string];

const C = {
  comment: "text-[#6f6680]",
  key: "text-[#ef6fd3]",
  name: "text-[#b48cf2]",
  punct: "text-[#9c93ad]",
  str: "text-[#e078c8]",
};

const CODE: Token[][] = [
  [["// Importing a single module", C.comment]],
  [
    ["import ", C.key],
    ["moduleName ", C.name],
    ["from", C.key],
  ],
  [
    ["'modulePath'", C.str],
    [";", C.punct],
  ],
  [],
  [["// Importing multiple modules", C.comment]],
  [
    ["import ", C.key],
    ["{ ", C.punct],
    ["module1", C.name],
    [", ", C.punct],
    ["module2 ", C.name],
    ["} ", C.punct],
    ["from", C.key],
  ],
  [
    ["'modulePath'", C.str],
    [";", C.punct],
  ],
  [],
  [["// Importing an entire module as an object", C.comment]],
  [
    ["import ", C.key],
    ["* ", C.punct],
    ["as ", C.key],
    ["utils ", C.name],
    ["from", C.key],
  ],
  [
    ["'./utils'", C.str],
    [";", C.punct],
  ],
];

const LINE_LEN = CODE.map((line) => line.reduce((m, [t]) => m + t.length, 0));
// Character offset where each line starts (+1 per line for the newline)
const LINE_START = LINE_LEN.map((_, i) =>
  LINE_LEN.slice(0, i).reduce((a, b) => a + b + 1, 0),
);
const TOTAL = LINE_START[CODE.length - 1] + LINE_LEN[CODE.length - 1];

function CodeEditor() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      setTyped(Math.min(n, TOTAL));
      if (n >= TOTAL) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const shown = reduce ? TOTAL : typed;
  // Line where the caret currently sits
  const caretLine = Math.max(
    0,
    LINE_START.findLastIndex((start) => start <= shown),
  );

  return (
    <div
      ref={ref}
      className="relative h-full overflow-hidden rounded-tl-2xl border-l border-t border-white/[0.08] bg-[#1a1426]/70 py-5 backdrop-blur-md"
    >
      <pre className="font-mono text-[13px] leading-[1.75] sm:text-[15px] lg:text-[17px]">
        <code>
          {CODE.map((line, li) => {
            let left = Math.max(
              0,
              Math.min(shown - LINE_START[li], LINE_LEN[li]),
            );
            return (
              <div key={li} className="flex">
                <span className="w-12 shrink-0 select-none pr-4 text-right text-white/20">
                  {li + 1}
                </span>
                <span className="whitespace-pre">
                  {line.map(([t, color], ti) => {
                    const part = t.slice(0, Math.max(0, left));
                    left -= t.length;
                    return (
                      <span key={ti} className={color}>
                        {part}
                      </span>
                    );
                  })}
                  {li === caretLine && (
                    <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-grad-start" />
                  )}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
      {/* fade out at the bottom like the design */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d0a13] to-transparent" />
    </div>
  );
}

const SQUARES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CHIPS = [
  { label: "Web App", className: "left-0 top-[16px]" },
  { label: "Mobile App", className: "left-[123px] top-0" },
  { label: "AI", className: "left-[227px] top-[59px]" },
  { label: "Commerce", className: "left-[69px] top-[76px]" },
];

export default function TechCard({ className }: { className?: string }) {
  return (
    <BentoCard className={className} tilt={3} depth={40} phase={2.4}>
      <div aria-hidden className="absolute inset-0 bg-[#0b0810]" />
      {/* Blueprint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(80%_90%_at_60%_40%,#000,transparent)]"
      />
      {/* Blinking squares along the top */}
      <div
        aria-hidden
        className="absolute right-0 top-[22px] hidden gap-[27px] pr-3 sm:flex"
      >
        {SQUARES.map((i) => (
          <motion.span
            key={i}
            className="size-[22px] rounded-md border border-white/15"
            animate={{
              backgroundColor: [
                "rgba(102,34,159,0)",
                "rgba(102,34,159,0.7)",
                "rgba(102,34,159,0)",
              ],
            }}
            transition={{
              duration: 2.4,
              delay: (i * 1.7) % 7,
              repeat: Infinity,
              repeatDelay: 4 + (i % 3),
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col lg:min-h-[403px] lg:flex-row">
        <div className="flex flex-col p-7 lg:w-[46%] lg:p-[45px] lg:pr-4">
          <Eyebrow>Technology</Eyebrow>
          <Kicker className="mt-4">Build for What&rsquo;s Next</Kicker>
          <h3 className={cn(titleClass, "mt-4 text-[26px] lg:text-[34px]")}>
            Technology with
            <br />
            Purpose
          </h3>

          <div className="relative mt-8 h-[115px] w-[290px] max-w-full">
            {CHIPS.map((c, i) => (
              <motion.div
                key={c.label}
                className={cn("absolute", c.className)}
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + i * 0.12,
                  ease: EASE,
                }}
              >
                <Floaty delay={i * 0.7} distance={5} duration={4 + i * 0.6}>
                  <Chip className="rounded-full">{c.label}</Chip>
                </Floaty>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-[300px] pl-7 sm:pl-12 lg:absolute lg:bottom-1 lg:left-[45.8%] lg:right-0 lg:top-[59px] lg:h-auto lg:pl-0">
          <ParallaxLayer amount={-28} className="h-[calc(100%+40px)]">
            <CodeEditor />
          </ParallaxLayer>
        </div>
      </div>
    </BentoCard>
  );
}
