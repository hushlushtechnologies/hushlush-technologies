"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Twinkling stars + shooting stars ───────────────────────── */

function Stars() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      s: Math.random() * 2 + 0.5,
      o: Math.random() * Math.PI * 2,
    }));
    let shoot: { x: number; y: number; t: number } | null = null;
    let next = performance.now() + 1500;

    const draw = (now: number) => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (const s of stars) {
        ctx.globalAlpha = reduce ? 0.6 : 0.25 + 0.75 * Math.abs(Math.sin(t * s.s * 0.6 + s.o));
        ctx.fillStyle = "#f3e8ff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) {
        if (!shoot && now > next) shoot = { x: Math.random() * w * 0.6 + w * 0.3, y: Math.random() * h * 0.3, t: 0 };
        if (shoot) {
          shoot.t += 0.018;
          const len = 160;
          const x = shoot.x - shoot.t * w * 0.5;
          const y = shoot.y + shoot.t * w * 0.25;
          const g = ctx.createLinearGradient(x, y, x + len, y - len / 2);
          g.addColorStop(0, "rgba(255,255,255,0.9)");
          g.addColorStop(1, "rgba(233,110,216,0)");
          ctx.globalAlpha = Math.sin(Math.min(shoot.t, 1) * Math.PI);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + len, y - len / 2);
          ctx.stroke();
          if (shoot.t >= 1) {
            shoot = null;
            next = now + 3000 + Math.random() * 4000;
          }
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/* ───────────────────────── Planet (blurred sphere) with parallax ───────────────────────── */

function Planet({ mx, my, depth, pos, className, delay }: { mx: MotionValue<number>; my: MotionValue<number>; depth: number; pos: string; className: string; delay: number }) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div aria-hidden style={{ x, y }} className={`pointer-events-none absolute ${pos}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay, ease: EASE }}
        className={`size-full rounded-full ${className}`}
      />
    </motion.div>
  );
}

/* ───────────────────────── Scene ───────────────────────── */

const digit = {
  hidden: { opacity: 0, y: -160, rotate: -25, scale: 0.6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 140, damping: 11, delay: 0.5 + i * 0.15 },
  }),
};

export default function NotFoundScene() {
  const reduce = !!useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 40, damping: 15 });
  const my = useSpring(rawY, { stiffness: 40, damping: 15 });

  // astronaut leans/drifts toward the cursor
  const astroX = useTransform(mx, (v) => v * 1.6);
  const astroY = useTransform(my, (v) => v * 1.2);
  const astroTilt = useTransform(mx, (v) => v * 0.5);
  const textX = useTransform(mx, (v) => v * -0.4);
  const textY = useTransform(my, (v) => v * -0.4);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    rawX.set((e.clientX / window.innerWidth - 0.5) * 40);
    rawY.set((e.clientY / window.innerHeight - 0.5) * 40);
  };

  return (
    <section
      onPointerMove={onMove}
      aria-labelledby="nf-title"
      className="relative flex min-h-[720px] h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(115deg,#22095a_0%,#2d0f57_35%,#3d1863_65%,#4e2470_100%)]"
    >
      {/* planets */}
      <Planet mx={mx} my={my} depth={-0.8} delay={0.1} pos="-left-[1%] top-[8vh] size-[clamp(180px,17vw,330px)]" className="bg-[radial-gradient(circle_at_70%_40%,#3a1086,#28095f_60%,#22095a)] opacity-90" />
      <Planet mx={mx} my={my} depth={1.4} delay={0.25} pos="left-[70.5vw] -top-[32%] size-[clamp(360px,47vw,900px)]" className="bg-[radial-gradient(circle_at_25%_80%,#6d33ad,#4f2384_55%,#3d1b6b)] opacity-95" />
      <Planet mx={mx} my={my} depth={-1.2} delay={0.4} pos="left-[8vw] top-[81%] size-[clamp(220px,17vw,330px)]" className="bg-[radial-gradient(circle_at_40%_20%,#33106f,#1c0838_70%)]" />

      <Stars />

      {/* fade to the footer */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-b from-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center px-5 text-center">
        <motion.h1
          id="nf-title"
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: EASE }}
          className="max-w-[900px] font-display text-[clamp(1.75rem,3.35vw,4rem)] font-bold leading-[1.05] tracking-[-0.01em]"
        >
          We Can’t Find The Page That You’re Looking For :(
        </motion.h1>

        {/* 404 */}
        <div className="relative mt-[clamp(1.5rem,2.2vw,2.75rem)] flex items-center font-display text-[clamp(9rem,15.5vw,18.5rem)] font-bold leading-[0.8] text-white" aria-hidden>
          {["4", "0", "4"].map((d, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={digit}
              initial={reduce ? "show" : "hidden"}
              animate="show"
              className="inline-block drop-shadow-[0_10px_60px_rgba(233,110,216,0.25)]"
            >
              {d}
            </motion.span>
          ))}

          {/* astronaut floating through the 0 */}
          <motion.div style={{ x: astroX, y: astroY, rotate: astroTilt }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[38%]">
            <motion.div
              initial={{ opacity: 0, scale: 0.3, rotate: -180, y: -200 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{ duration: 1.6, delay: 1.1, ease: EASE }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -14, 0], rotate: [-4, 5, -4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.7 }}
                className="relative w-[clamp(110px,9.6vw,190px)]"
              >
                <Image src="/images/404/astronaut.webp" alt="" width={184} height={244} priority className="h-auto w-full drop-shadow-[0_20px_30px_rgba(20,0,50,0.5)]" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        <span className="sr-only">Error 404 — page not found</span>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.6, ease: EASE }} className="mt-[clamp(2.5rem,4.6vw,5.5rem)]">
          <Link
            href="/"
            className="group inline-flex h-[49px] items-center gap-12 rounded-full border border-white/10 bg-[#1a0f2a]/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-grad-mid/50 hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.7)]"
          >
            Back To Homepage
            <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
              <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
