"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import CameraModel from "@/components/three/CameraModel";

/* ───────────────────────── Copy ───────────────────────── */

const PARAGRAPH: { w: string; hl?: boolean }[] = (
  "From The First Concept To The |Final Cut|, We Turn Ideas Into |Visual Experiences Designed| To |Capture Attention| And Leave An Impression."
)
  .split("|")
  .flatMap((part, i) =>
    part
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, hl: i % 2 === 1 }))
  )
  // glue punctuation (",") onto the previous word so there's no stray space
  .reduce<{ w: string; hl?: boolean }[]>((acc, t) => {
    if (/^[.,!?;:]+$/.test(t.w) && acc.length) acc[acc.length - 1] = { ...acc[acc.length - 1], w: acc[acc.length - 1].w + t.w };
    else acc.push(t);
    return acc;
  }, []);

/* ───────────────────────── Helpers ───────────────────────── */

function Word({ word, i, n, progress, from, to }: { word: { w: string; hl?: boolean }; i: number; n: number; progress: MotionValue<number>; from: number; to: number }) {
  const step = (to - from) / n;
  const opacity = useTransform(progress, [from + i * step, from + (i + 1) * step], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={word.hl ? "text-primary" : undefined}>
      {word.w}{" "}
    </motion.span>
  );
}

/** Camera viewfinder overlay: corner brackets, REC dot and a running timecode */
function Viewfinder({ progress }: { progress: MotionValue<number> }) {
  // brackets close in around the camera body
  const top = useTransform(progress, [0.15, 0.5], ["4%", "18%"]);
  const bottom = useTransform(progress, [0.15, 0.5], ["30%", "42%"]);
  const side = useTransform(progress, [0.15, 0.5], ["-30%", "-6%"]);
  const opacity = useTransform(progress, [0.18, 0.32, 0.9, 1], [0, 1, 1, 0.6]);
  const [tc, setTc] = useState("00:00:00:00");

  useMotionValueEvent(progress, "change", (v) => {
    const frames = Math.floor(Math.max(0, v) * 24 * 42); // ~42s of "footage" across the scroll
    const f = frames % 24;
    const s = Math.floor(frames / 24) % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    setTc(`00:00:${pad(s)}:${pad(f)}`);
  });

  const corner = "absolute size-10 border-text-primary/70 lg:size-16";
  return (
    <motion.div aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0 z-10">
      <motion.div style={{ top, bottom, left: side, right: side }} className="absolute">
        <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
        <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
        <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
        <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
        <div className="absolute right-4 top-4 flex items-center gap-2 font-mono text-xs tracking-widest text-text-primary/80 lg:right-6 lg:top-6 lg:text-sm">
          <span className="size-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
          REC
        </div>
        <div className="absolute bottom-4 right-4 font-mono text-xs tracking-widest text-text-primary/70 lg:bottom-6 lg:right-6 lg:text-sm">{tc}</div>
        <div className="absolute bottom-4 left-4 font-mono text-xs tracking-widest text-text-primary/50 lg:bottom-6 lg:left-6 lg:text-sm">4K · 24FPS</div>
        {/* centre crosshair */}
        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-text-primary/30" />
        <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-text-primary/30" />
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function IdeasFrame() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Desktop pins the stage; phones/tablets scroll normally
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // One stable progress value: pinned range on desktop, pass-through range elsewhere
  const pinnedScroll = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const flowScroll = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useMotionValue(0);
  const pinnedRef = useRef(pinned);
  useEffect(() => {
    pinnedRef.current = pinned;
    progress.set((pinned ? pinnedScroll : flowScroll).scrollYProgress.get());
  }, [pinned, progress, pinnedScroll, flowScroll]);
  useMotionValueEvent(pinnedScroll.scrollYProgress, "change", (v) => pinnedRef.current && progress.set(v));
  useMotionValueEvent(flowScroll.scrollYProgress, "change", (v) => !pinnedRef.current && progress.set(v));

  // Headline: letters slide in, then the line drifts apart slightly
  const titleX = useTransform(progress, [0, 1], reduce ? [0, 0] : [-30, 30]);
  const glow = useTransform(progress, [0, 0.5, 1], [0.5, 1, 0.7]);

  const title = "Ideas Need A Frame.";

  return (
    <section
      ref={sectionRef}
      id="production"
      aria-labelledby="frame-title"
      className="relative motion-safe:lg:h-[260vh]"
    >
      <div className="relative overflow-hidden lg:h-dvh lg:min-h-[760px] motion-safe:lg:sticky motion-safe:lg:top-0">
        {/* Background glow behind the camera */}
        <motion.div
          aria-hidden
          style={{ opacity: glow }}
          className="absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_50%,rgba(70,20,110,0.75),rgba(30,8,50,0.4)_55%,transparent_80%)]"
        />

        <div className="relative flex min-h-[900px] flex-col py-24 lg:block lg:h-full lg:min-h-0 lg:py-0">
          {/* Camera model */}
          <div className="relative mx-auto mt-8 h-[560px] w-fit lg:absolute lg:left-1/2 lg:top-[3.2%] lg:mt-0 lg:h-[97.7%] lg:-translate-x-1/2">
            <CameraModel progress={progress} className="h-full" />
            <Viewfinder progress={progress} />
          </div>

          {/* Headline (in front of the camera, like the design) */}
          <div className="container-site relative z-20 order-first lg:absolute lg:inset-x-0 lg:top-[27.8%]">
            <motion.h2
              id="frame-title"
              style={{ x: titleX }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20%" }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
              className="font-display text-[clamp(2.5rem,3.75vw,4.5rem)] font-bold uppercase leading-none drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)]"
              aria-label={title}
            >
              {title.split(" ").map((word, wi) => (
                // keep each word together so lines only break between words
                <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                  {word.split("").map((ch, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom">
                      <motion.span
                        className="inline-block"
                        variants={{
                          hidden: { y: "110%", rotate: 8 },
                          show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                        }}
                      >
                        {ch}
                      </motion.span>
                    </span>
                  ))}
                  {"\u00a0"}
                </span>
              ))}
            </motion.h2>
          </div>

          {/* Paragraph — words light up as you scroll */}
          <div className="container-site relative z-20 mt-10 lg:absolute lg:inset-x-0 lg:top-[71%] lg:mt-0">
            <p className="max-w-[960px] text-[clamp(1.5rem,2.4vw+0.5rem,2.75rem)] leading-[1.06] tracking-[-0.01em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] lg:ml-[310px]">
              {PARAGRAPH.map((word, i) => (
                <Word key={i} word={word} i={i} n={PARAGRAPH.length} progress={progress} from={reduce ? -1 : 0.3} to={reduce ? -0.5 : 0.8} />
              ))}
            </p>
          </div>
        </div>

        {/* Soft fade at the bottom so the tripod melts into the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>
  );
}
