"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { useIntroReady } from "@/lib/intro";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Timeline (seconds after the preloader opens) */
const T_BEAM = 0.2; // beam strikes down
const T_IMPACT = 1.1; // hits the ground → flash + floor spreads
const T_TEXT = 1.5;

/* ───────────────────────── Rising light particles ───────────────────────── */

function Particles({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c || !active || reduce) return;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(c);

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number };
    const ps: P[] = [];
    const spawn = (w: number, h: number) => {
      // born on the glowing floor near the beam, drift up and outward
      const spread = (Math.random() - 0.5) * 2;
      ps.push({
        x: w * 0.5 + spread * w * 0.22 * Math.random(),
        y: h * (0.66 + Math.random() * 0.12),
        vx: spread * 0.25,
        vy: -(0.25 + Math.random() * 0.9),
        life: 0,
        max: 140 + Math.random() * 160,
        r: 0.6 + Math.random() * 1.8,
        hue: 230 + Math.random() * 60,
      });
    };

    const loop = () => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) if (ps.length < 220) spawn(w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.998;
        const t = p.life / p.max;
        if (t >= 1) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.sin(t * Math.PI) * 0.9;
        ctx.fillStyle = `hsl(${p.hue} 90% 80%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [active, reduce]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/* ───────────────────────── Copy ───────────────────────── */

const letter: Variants = {
  hidden: { opacity: 0, y: "60%", filter: "blur(12px)" },
  show: { opacity: 1, y: "0%", filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

const HEADLINE = "Let’s Build What’s Next.";

/* ───────────────────────── Section ───────────────────────── */

export default function ContactHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const ready = useIntroReady();
  const play = ready || reduce;

  // Pinned: scrolling flies the camera into the beam
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  // the fly-into-the-beam effect is desktop-only (on phones the hero isn't pinned)
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    const raf = requestAnimationFrame(on);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", on);
    };
  }, []);
  const progress = useTransform(() => (reduce || !wide ? 0 : p.get()));
  const zoom = useTransform(progress, [0, 1], [1, 1.9]);
  const sceneY = useTransform(progress, [0, 1], ["0%", "8%"]);
  const textOpacity = useTransform(progress, [0.05, 0.45], [1, 0]);
  const textScale = useTransform(progress, [0, 0.45], [1, 0.92]);
  const textBlur = useTransform(progress, [0.05, 0.45], ["blur(0px)", "blur(10px)"]);
  const whiteout = useTransform(progress, [0.4, 0.68, 0.95], [0, 0.8, 0]);
  const sceneFade = useTransform(progress, [0.7, 1], [1, 0]);

  return (
    <section ref={ref} aria-labelledby="contact-title" className="relative h-dvh min-h-[640px] lg:h-[170vh]">
      <div className="sticky top-0 h-dvh min-h-[640px] overflow-hidden">
        {/* ── Scene ── */}
        <motion.div className="absolute inset-0 origin-[50%_62%] bg-background" style={{ scale: zoom, y: sceneY, opacity: sceneFade }}>
          {/* floor: spreads outward from the impact point */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.12, filter: "blur(14px) brightness(1.8)" }}
            animate={play ? { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" } : undefined}
            transition={{ duration: 1.6, delay: reduce ? 0 : T_IMPACT, ease: EASE }}
          >
            <Image src="/images/contact/beam.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
          </motion.div>

          {/* beam: strikes from the top down */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "inset(0% 44% 100% 44%)" }}
            animate={play ? { clipPath: "inset(0% 40% 32% 40%)", opacity: [1, 1, 0] } : undefined}
            transition={{ clipPath: { duration: 0.9, delay: reduce ? 0 : T_BEAM, ease: [0.7, 0, 0.84, 0] }, opacity: { duration: 0.6, delay: T_IMPACT + 1.2, times: [0, 0.5, 1] } }}
          >
            <Image src="/images/contact/beam.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
          </motion.div>

          {/* purple grade to match the brand (source render is blue) */}
          <div aria-hidden className="absolute inset-0 bg-[#6d3ce0] opacity-55 mix-blend-color" />

          {/* living beam: soft flicker + core glow */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-0 h-[66%] w-[6%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(200,180,255,0.0),rgba(220,200,255,0.45)_60%,rgba(255,240,255,0.8))] mix-blend-screen blur-xl"
            initial={{ opacity: 0 }}
            animate={play && !reduce ? { opacity: [0.35, 0.8, 0.45, 0.9, 0.35] } : play ? { opacity: 0.5 } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: T_IMPACT }}
          />

          {/* impact flash */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[64%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,240,255,0.95),rgba(170,120,255,0.45)_30%,transparent_70%)] mix-blend-screen"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={play && !reduce ? { opacity: [0, 1, 0], scale: [0.2, 1, 1.4] } : undefined}
            transition={{ duration: 1.3, delay: T_IMPACT - 0.05, ease: "easeOut" }}
          />
          {/* shockwave ring along the floor */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[66%] h-[10vmax] w-[30vmax] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#c9a8ff]/60 shadow-[0_0_40px_rgba(180,140,255,0.6)]"
            initial={{ opacity: 0, scale: 0.1 }}
            animate={play && !reduce ? { opacity: [0, 1, 0], scale: [0.1, 4] } : undefined}
            transition={{ duration: 1.6, delay: T_IMPACT, ease: "easeOut" }}
          />

          <Particles active={play} />
        </motion.div>

        {/* corner light beams (same family as the Careers hero) */}
        <div aria-hidden className="absolute -left-[10%] -top-[20%] h-[80%] w-[30%] rotate-[-35deg] bg-[linear-gradient(90deg,transparent,rgba(233,224,42,0.1),transparent)] blur-2xl" />
        <div aria-hidden className="absolute -right-[8%] -top-[10%] h-[90%] w-[26%] rotate-[-35deg] bg-[linear-gradient(90deg,transparent,rgba(120,140,255,0.09),transparent)] blur-2xl" />

        {/* mobile readability scrim — the beam sits right behind the copy on narrow screens */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_55%,rgba(6,5,8,0.7),transparent)] lg:hidden" />

        {/* whiteout as you dive into the light */}
        <motion.div aria-hidden style={{ opacity: whiteout }} className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_60%,#f3e8ff,#b48cff_45%,#2a0b45)]" />

        {/* soft hand-off into the next section */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-b from-transparent to-background" />

        {/* ── Copy ── */}
        <motion.div
          style={{ opacity: textOpacity, scale: textScale, filter: textBlur }}
          className="relative z-10 flex h-full items-center"
        >
          <div className="mx-auto w-full max-w-[1100px] lg:w-fit px-[clamp(1.25rem,5.5vw,2rem)] pt-[4vh]">
            <motion.h1
              id="contact-title"
              aria-label="Let’s Build What’s Next."
              initial="hidden"
              animate={play ? "show" : "hidden"}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: reduce ? 0 : T_TEXT } } }}
              className="font-display text-[clamp(2.5rem,4.5vw,5.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.01em] drop-shadow-[0_6px_40px_rgba(30,0,60,0.6)] lg:whitespace-nowrap"
            >
              {HEADLINE.split(" ").map((w, wi, arr) => (
                <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                  {w.split("").map((ch, ci) => (
                    <motion.span key={ci} variants={letter} className="inline-block">
                      {ch}
                    </motion.span>
                  ))}
                  {wi < arr.length - 1 && " "}
                </span>
              ))}
            </motion.h1>

            <motion.div
              initial="hidden"
              animate={play ? "show" : "hidden"}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: reduce ? 0 : T_TEXT + 0.9 } } }}
              className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between lg:mt-[48px]"
            >
              <div className="max-w-[330px]">
                <motion.p variants={fadeUp} className="text-sm text-text-primary/75">
                  Have An Idea, A Challenge, Or A Vision In Mind?
                </motion.p>
                <motion.p variants={fadeUp} className="mt-3 text-[clamp(1.25rem,1.4vw,1.5rem)] leading-[1.2]">
                  Bring It To Us. We&apos;ll Turn It Into Something Worth Remembering.
                </motion.p>
              </div>
              <motion.div variants={fadeUp} className="sm:pt-[22px]">
                <Link
                  href="#enquiry"
                  className="group inline-flex h-[49px] items-center gap-4 rounded-full border border-white/10 bg-surface/70 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-colors duration-300 hover:border-grad-mid/50"
                >
                  Start The Conversation
                  <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                    <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={play ? { opacity: 1 } : undefined}
          transition={{ delay: T_TEXT + 1.6 }}
          style={{ opacity: textOpacity }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-text-primary/50"
        >
          SCROLL
          <span className="h-10 w-px overflow-hidden bg-white/15">
            <span className="block h-1/2 w-full animate-[scrollcue_1.8s_ease-in-out_infinite] bg-primary" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
