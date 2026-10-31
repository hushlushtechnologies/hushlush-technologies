"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { markIntroDone } from "@/lib/intro";

const EASE = [0.76, 0, 0.24, 1] as const;
const MIN_MS = 2400; // the show always lasts at least this long
const MAX_MS = 7000; // never block the site longer than this
const SESSION_KEY = "hl-intro-seen";

const STATUS = [
  "Booting creative engine",
  "Loading brand assets",
  "Calibrating motion systems",
  "Rendering 3D surfaces",
  "Syncing ideas",
  "Experience ready",
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@<>/";

/** Text that scrambles into place each time it changes */
function Scramble({ text }: { text: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let frame = 0;
    const total = 14;
    const id = setInterval(() => {
      frame++;
      setOut(
        text
          .split("")
          .map((ch, i) => (ch === " " || i < (frame / total) * text.length ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("")
      );
      if (frame >= total) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [text]);
  return <>{out}</>;
}

const R = 92;
const CIRC = 2 * Math.PI * R;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const progress = useMotionValue(0);
  const dash = useTransform(progress, (v) => CIRC * (1 - v));
  const bar = useTransform(progress, (v) => `scaleX(${v})`);
  const done = useRef(false);

  useEffect(() => {
    // Returning visitors in the same tab session skip the show
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      markIntroDone();
      requestAnimationFrame(() => setVisible(false));
      return;
    }

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const start = performance.now();
    let target = 0.25;
    let raf = 0;

    // Real loading milestones push the target forward
    document.fonts?.ready.then(() => (target = Math.max(target, 0.6)));
    const onLoad = () => (target = 1);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    const failSafe = setTimeout(() => (target = 1), MAX_MS);

    const tick = (now: number) => {
      const elapsed = now - start;
      // never outrun the minimum show time
      const cap = Math.min(1, elapsed / MIN_MS);
      const goal = Math.min(target, Math.max(cap, target < 1 ? cap * 0.9 : cap));
      const v = progress.get() + (goal - progress.get()) * 0.08;
      progress.set(v);
      setPct(Math.min(100, Math.round(v * 100)));

      if (v > 0.995 && elapsed >= MIN_MS && !done.current) {
        done.current = true;
        progress.set(1);
        setPct(100);
        setTimeout(() => {
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {}
          markIntroDone();
          setVisible(false);
          root.style.overflow = prevOverflow;
        }, 450);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failSafe);
      window.removeEventListener("load", onLoad);
      root.style.overflow = prevOverflow;
    };
  }, [progress]);

  const status = STATUS[Math.min(STATUS.length - 1, Math.floor((pct / 100) * (STATUS.length - 1) + 0.0001))];

  return (
    <>
      {/* Without JavaScript the site must still be usable */}
      <noscript>
        <style>{`#preloader{display:none!important}`}</style>
      </noscript>
      {/* Runs before first paint: hide the loader instantly for returning visitors */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${SESSION_KEY}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-skip")}catch(e){}`,
        }}
      />
      <style>{`.intro-skip #preloader{display:none!important}`}</style>

      <AnimatePresence>
        {visible && (
          <motion.div id="preloader" role="status" aria-label={`Loading ${pct}%`} className="fixed inset-0 z-[100] text-text-primary" exit="exit" initial="show" animate="show">
            {/* Split panels that open to reveal the site */}
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-background"
              variants={{ show: { y: 0 }, exit: { y: "-100%", transition: { duration: 1.1, ease: EASE, delay: 0.25 } } }}
            >
              <PanelArt half="top" />
            </motion.div>
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-background"
              variants={{ show: { y: 0 }, exit: { y: "100%", transition: { duration: 1.1, ease: EASE, delay: 0.25 } } }}
            >
              <PanelArt half="bottom" />
            </motion.div>

            {/* Seam light that flashes as the doors open */}
            <motion.div
              aria-hidden
              className="bg-brand-gradient absolute inset-x-0 top-1/2 h-px -translate-y-1/2 shadow-[0_0_30px_6px_rgba(183,43,202,0.8)]"
              variants={{ show: { scaleX: 0, opacity: 0 }, exit: { scaleX: [0, 1, 1], opacity: [1, 1, 0], transition: { duration: 0.9, times: [0, 0.35, 1] } } }}
            />

            {/* HUD content */}
            <motion.div
              className="absolute inset-0"
              variants={{ show: { opacity: 1, scale: 1, filter: "blur(0px)" }, exit: { opacity: 0, scale: 1.08, filter: "blur(8px)", transition: { duration: 0.4 } } }}
            >
              {/* corners */}
              {["left-5 top-5 border-l border-t", "right-5 top-5 border-r border-t", "bottom-5 left-5 border-b border-l", "bottom-5 right-5 border-b border-r"].map((c) => (
                <motion.span
                  key={c}
                  aria-hidden
                  className={`absolute size-8 border-white/40 lg:size-12 ${c}`}
                  initial={{ opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}

              {/* top labels */}
              <div className="absolute inset-x-10 top-8 flex justify-between font-mono text-[10px] tracking-[0.25em] text-text-primary/50 lg:inset-x-20 lg:top-10 lg:text-xs">
                <span>HUSH LUSH // SYS 26.10</span>
                <span className="hidden sm:inline">25.2048° N · 55.2708° E</span>
              </div>

              {/* centre */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative size-[240px] lg:size-[280px]">
                  <svg viewBox="-120 -120 240 240" className="absolute inset-0 size-full" aria-hidden>
                    <defs>
                      <linearGradient id="pl-g" x1="0" x2="1">
                        <stop stopColor="#e96ed8" />
                        <stop offset="0.5" stopColor="#b72bca" />
                        <stop offset="1" stopColor="#62229d" />
                      </linearGradient>
                    </defs>
                    {/* rotating tick ring */}
                    <g className="origin-center animate-[spin_14s_linear_infinite]">
                      {Array.from({ length: 72 }, (_, i) => (
                        <line
                          key={i}
                          x1={0}
                          y1={-112}
                          x2={0}
                          y2={i % 6 === 0 ? -104 : -108}
                          stroke="white"
                          strokeOpacity={i % 6 === 0 ? 0.5 : 0.18}
                          transform={`rotate(${i * 5})`}
                        />
                      ))}
                    </g>
                    {/* counter-rotating dashed ring */}
                    <circle r={100} fill="none" stroke="#b72bca" strokeOpacity={0.35} strokeDasharray="2 10" className="origin-center animate-[spin_8s_linear_infinite_reverse]" />
                    {/* progress arc */}
                    <circle r={R} fill="none" stroke="white" strokeOpacity={0.06} strokeWidth={2} />
                    <motion.circle
                      r={R}
                      fill="none"
                      stroke="url(#pl-g)"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      style={{ strokeDashoffset: dash }}
                      transform="rotate(-90)"
                    />
                  </svg>

                  {/* logo with scan reveal */}
                  <div className="absolute inset-0 grid place-items-center">
                    <motion.div
                      className="relative w-[72px] lg:w-[86px]"
                      initial={{ clipPath: "inset(100% 0 0 0)", filter: "brightness(2)" }}
                      animate={{ clipPath: "inset(0% 0 0 0)", filter: "brightness(1)" }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    >
                      <Image src="/images/logo-mark.svg" alt="" width={43} height={40} priority className="h-auto w-full drop-shadow-[0_0_24px_rgba(233,224,42,0.5)]" />
                    </motion.div>
                    {/* scan line across the logo */}
                    <motion.span
                      aria-hidden
                      className="bg-brand-gradient absolute h-px w-[110px] shadow-[0_0_12px_2px_rgba(233,110,216,0.8)]"
                      animate={{ y: [-50, 50, -50], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* readout */}
                <div className="mt-8 text-center">
                  <p className="font-display text-5xl font-bold tabular-nums tracking-tight lg:text-6xl">
                    {String(pct).padStart(3, "0")}
                    <span className="text-primary">%</span>
                  </p>
                  <p className="mt-3 h-4 font-mono text-[11px] uppercase tracking-[0.3em] text-text-primary/60 lg:text-xs">
                    <Scramble text={status} />
                  </p>
                </div>
              </div>

              {/* bottom progress bar */}
              <div className="absolute inset-x-10 bottom-10 lg:inset-x-20 lg:bottom-12">
                <div className="flex justify-between font-mono text-[10px] tracking-[0.25em] text-text-primary/40 lg:text-xs">
                  <span>WE BUILD WHAT&rsquo;S NEXT</span>
                  <span className="tabular-nums">{String(pct).padStart(3, "0")}/100</span>
                </div>
                <div className="mt-3 h-px w-full bg-white/10">
                  <motion.div className="bg-brand-gradient h-full origin-left shadow-[0_0_10px_rgba(233,110,216,0.8)]" style={{ transform: bar }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Background art inside each door: grid, glow and a sweeping scan line */
function PanelArt({ half }: { half: "top" | "bottom" }) {
  return (
    <div aria-hidden className={`absolute inset-x-0 h-[200%] ${half === "top" ? "top-0" : "bottom-0"}`}>
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-position:center] [background-size:64px_64px] [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_50%_50%,rgba(102,34,159,0.45),transparent_70%)]" />
      <motion.div
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-grad-mid/10 to-transparent"
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
