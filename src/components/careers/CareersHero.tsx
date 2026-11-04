"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useIntroReady } from "@/lib/intro";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Figma frame 1920 × 1080 — boxes are [left, top, width] in frame px */
const FW = 1920;
const FH = 1080;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

const LEFT_HAND = { left: 0, top: 350, w: 838 }; // fingertip ≈ (765, 560)
const RIGHT_HAND = { left: 1045, top: -32, w: 765 }; // fingertip ≈ (1130, 425)
const LOGO = { left: 741, top: 321, w: 440 };

/* ───────────────────────── Spark where the fingers meet ───────────────────────── */

function Spark({ progress, at }: { progress: MotionValue<number>; at: [number, number] }) {
  const flash = useTransform(progress, [0.42, 0.5, 0.62], [0, 1, 0]);
  const ring = useTransform(progress, [0.45, 0.75], [0.2, 3]);
  const ringO = useTransform(progress, [0.45, 0.5, 0.75], [0, 0.9, 0]);
  return (
    <div aria-hidden className="pointer-events-none absolute z-30" style={{ left: X(at[0]), top: Y(at[1]) }}>
      <motion.span
        style={{ opacity: flash }}
        className="absolute -left-[16vw] -top-[16vw] size-[32vw] rounded-full bg-[radial-gradient(closest-side,rgba(255,236,170,0.95),rgba(233,180,60,0.35)_35%,transparent_70%)] mix-blend-screen"
      />
      <motion.span
        style={{ scale: ring, opacity: ringO }}
        className="absolute -left-[5vw] -top-[5vw] size-[10vw] rounded-full border-2 border-primary/80 shadow-[0_0_40px_rgba(233,224,42,0.7)]"
      />
    </div>
  );
}

/* ───────────────────────── Copy ───────────────────────── */

const letter: Variants = {
  hidden: { y: "105%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 1, ease: EASE } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

function SplitLine({ text, className, style }: { text: string; className?: string; style?: Record<string, unknown> }) {
  return (
    <motion.span
      aria-hidden
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
      className={className}
      style={style as never}
    >
      {text.split("").map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span variants={letter} className="inline-block whitespace-pre">
            {ch}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function CareersHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const ready = useIntroReady();

  // Pinned for one extra screen: scrolling brings the hands together
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const progress = useTransform(p, (v) => (reduce ? 0 : v));

  // mouse
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 50, damping: 18 });
  const my = useSpring(rawY, { stiffness: 50, damping: 18 });
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduce]);

  /* Scroll choreography (in % of each element's own size) */
  const leftX = useTransform(progress, [0, 0.5], ["0%", "10%"]);
  const leftY = useTransform(progress, [0, 0.5], ["0%", "-7%"]);
  const rightX = useTransform(progress, [0, 0.5], ["0%", "-9%"]);
  const rightY = useTransform(progress, [0, 0.5], ["0%", "8%"]);
  const handsOut = useTransform(progress, [0.62, 1], [1, 0]);
  const logoScale = useTransform(progress, [0, 0.5, 0.75], [1, 1.12, 1.6]);
  const logoRotY = useTransform(progress, [0, 0.5, 1], [0, 0, 360]);
  const logoOpacity = useTransform(progress, [0.75, 1], [1, 0]);
  const topLineX = useTransform(progress, [0.45, 1], ["0%", "-35%"]);
  const bottomLineX = useTransform(progress, [0.45, 1], ["0%", "35%"]);
  const textOpacity = useTransform(progress, [0.55, 0.9], [1, 0]);
  const glow = useTransform(progress, [0, 0.5, 1], [0.6, 1, 0.3]);

  // mouse parallax
  const lmx = useTransform(mx, (v) => v * -24);
  const lmy = useTransform(my, (v) => v * -16);
  const rmx = useTransform(mx, (v) => v * 24);
  const rmy = useTransform(my, (v) => v * 16);
  const logoTiltY = useTransform(mx, (v) => v * 22);
  const logoTiltX = useTransform(my, (v) => v * -16);
  const logoRY = useTransform(() => logoRotY.get() + logoTiltY.get());

  const show = ready ? "show" : "hidden";

  return (
    <section ref={ref} aria-labelledby="careers-title" className="relative lg:h-[200vh]">
      <div className="relative overflow-hidden pt-20 lg:sticky lg:pt-0 lg:top-0 lg:h-dvh lg:min-h-[720px]">
        {/* Background: purple core + two light beams */}
        <motion.div aria-hidden style={{ opacity: glow }} className="absolute inset-0 bg-[radial-gradient(45%_50%_at_45%_45%,rgba(70,20,110,0.75),transparent_75%)]" />
        <motion.div
          aria-hidden
          className="absolute -left-[10%] -top-[20%] h-[80%] w-[30%] rotate-[-35deg] bg-[linear-gradient(90deg,transparent,rgba(233,224,42,0.12),transparent)] blur-2xl"
          animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-[8%] -top-[10%] h-[90%] w-[26%] rotate-[-35deg] bg-[linear-gradient(90deg,transparent,rgba(120,140,255,0.1),transparent)] blur-2xl"
          animate={reduce ? undefined : { opacity: [1, 0.5, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Real heading: visible on phones/tablets, read by screen readers everywhere */}
        <motion.h1
          id="careers-title"
          initial={{ opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          className="container-site relative z-40 pt-8 font-display text-[clamp(2.75rem,11vw,4.5rem)] font-bold uppercase leading-[0.98] lg:sr-only"
        >
          Build Your <span className="block text-right">Next Chapter</span>
        </motion.h1>

        {/* Stage (Figma proportions) */}
        <div
          className="relative left-1/2 aspect-[1920/1080] w-[150vw] -translate-x-1/2 [container-type:inline-size] sm:w-[120vw] lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[max(100vw,177.78dvh)] lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          {/* Left hand */}
          <motion.div
            className="absolute z-10"
            style={{ left: X(LEFT_HAND.left), top: Y(LEFT_HAND.top), width: X(LEFT_HAND.w), x: lmx, y: lmy, opacity: handsOut }}
            initial={{ x: "-60%", opacity: 0 }}
            animate={ready ? { x: "0%", opacity: 1 } : undefined}
            transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
          >
            <motion.div style={{ x: leftX, y: leftY }}>
              <div className="relative aspect-[1335/1600] animate-[float_8s_ease-in-out_infinite] motion-reduce:animate-none">
                <Image src="/images/careers/lefthand.webp" alt="" fill priority sizes="45vw" className="object-contain" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right hand */}
          <motion.div
            className="absolute z-10"
            style={{ left: X(RIGHT_HAND.left), top: Y(RIGHT_HAND.top), width: X(RIGHT_HAND.w), x: rmx, y: rmy, opacity: handsOut }}
            initial={{ x: "60%", opacity: 0 }}
            animate={ready ? { x: "0%", opacity: 1 } : undefined}
            transition={{ duration: 1.8, ease: EASE, delay: 0.35 }}
          >
            <motion.div style={{ x: rightX, y: rightY }}>
              <div className="relative aspect-[1567/1600] animate-[float_9s_ease-in-out_infinite] motion-reduce:animate-none [animation-delay:-3s]">
                <Image src="/images/careers/righthand.webp" alt="" fill priority sizes="40vw" className="object-contain" />
              </div>
            </motion.div>
          </motion.div>

          {/* Headline (behind the logo, in front of the hands) */}
          <motion.div
            aria-hidden
            initial="hidden"
            animate={show}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.25, delayChildren: 0.6 } } }}
            style={{ opacity: textOpacity }}
            className="absolute inset-0 z-20 hidden font-display text-[6.05cqw] font-bold uppercase leading-none tracking-[-0.01em] drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)] lg:block"
          >
            <SplitLine text="Build Your" className="absolute block" style={{ left: X(322), top: Y(318), x: topLineX }} />
            <SplitLine text="Next Chapter" className="absolute block" style={{ right: X(322), top: Y(640), x: bottomLineX }} />
          </motion.div>

          {/* Golden phoenix */}
          <div className="absolute z-30 [perspective:1200px]" style={{ left: X(LOGO.left), top: Y(LOGO.top), width: X(LOGO.w) }}>
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -40, filter: "brightness(3) blur(12px)" }}
              animate={ready ? { scale: 1, opacity: 1, rotate: 0, filter: "brightness(1) blur(0px)" } : undefined}
              transition={{ duration: 1.6, ease: EASE, delay: 1 }}
            >
              <motion.div style={{ scale: logoScale, rotateY: logoRY, rotateX: logoTiltX, opacity: logoOpacity }} className="relative aspect-square">
                <div className="relative size-full animate-[float_7s_ease-in-out_infinite] motion-reduce:animate-none">
                  <Image src="/images/careers/centre.webp" alt="Hush Lush golden phoenix" fill priority sizes="25vw" className="object-contain drop-shadow-[0_20px_60px_rgba(233,180,60,0.35)]" />
                  {/* gold shimmer, clipped to the phoenix shape */}
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-[shimmer_4.5s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent_35%,rgba(255,250,220,0.85)_50%,transparent_65%)] bg-[length:250%_100%] mix-blend-overlay motion-reduce:hidden"
                    style={{ WebkitMaskImage: "url(/images/careers/centre.webp)", maskImage: "url(/images/careers/centre.webp)", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" } as CSSProperties}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <Spark progress={progress} at={[950, 500]} />
        </div>

        {/* Paragraph + CTA */}
        <motion.div
          initial="hidden"
          animate={show}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 1.6 } } }}
          style={{ opacity: textOpacity }}
          className="container-site relative z-40 -mt-6 pb-16 lg:absolute lg:inset-x-0 lg:bottom-[12vh] lg:mt-0 lg:flex lg:flex-col lg:items-end lg:pb-0"
        >
          <motion.p variants={fadeUp} className="max-w-[300px] text-sm leading-[1.1] text-text-primary/90 lg:w-[272px] lg:text-[15px]">
            Join A Team Of Strategists, Creators And Technologists Building The Brands, Experiences And Products Of What&rsquo;s Next.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 lg:mt-[26px] lg:w-[272px]">
            <Link
              href="#openings"
              className="group ml-auto inline-flex h-[49px] items-center gap-7 rounded-full border border-white/10 bg-surface/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-colors duration-300 hover:border-grad-mid/50 lg:flex lg:w-fit"
            >
              View Openings
              <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
