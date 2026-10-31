"use client";

import { useEffect, useRef } from "react";
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
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const PARAGRAPH =
  "We Are A Creative Technology Company Bringing Strategy, Design, Media And Digital Experiences Together To Help Ambitious Brands Move Forward.".split(" ");

function Word({ w, i, n, progress }: { w: string; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0.2, 1]);
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

const line: Variants = {
  hidden: { y: "110%", rotate: 3 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

export default function CtaCreativity() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();

  /* Scroll across the whole section pass */
  const { scrollYProgress: pass } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const p = useSpring(pass, { stiffness: 90, damping: 22, mass: 0.4 });
  // with reduced motion every range collapses to its resting value
  const r = (b: number[]) => (reduce ? b.map(() => b[Math.floor(b.length / 2)]) : b);

  // image card swings in from the right, settles, then drifts on exit
  const cardRotY = useTransform(p, [0.1, 0.5, 0.9], r([-38, 0, 8]));
  const cardRotZ = useTransform(p, [0.1, 0.5], r([8, 0]));
  const cardX = useTransform(p, [0.1, 0.5], r([160, 0]));
  const cardScale = useTransform(p, [0.1, 0.5, 0.9], r([0.82, 1, 0.96]));
  const cardClip = useTransform(p, [0.12, 0.45], reduce ? ["inset(0% 0% 0% 0% round 80px)", "inset(0% 0% 0% 0% round 80px)"] : ["inset(18% 0% 18% 60% round 80px)", "inset(0% 0% 0% 0% round 80px)"]);
  const imgY = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);
  const imgScale = useTransform(p, [0.1, 0.5], reduce ? [1.1, 1.1] : [1.4, 1.1]);

  // frosted glass slab behind the card rotates the other way
  const glassRot = useTransform(p, [0, 1], reduce ? [-22, -22] : [-48, -8]);
  const glassX = useTransform(p, [0, 1], reduce ? [0, 0] : [-120, 60]);
  const glassOpacity = useTransform(p, [0.1, 0.35], [0, 1]);

  // headline drifts slightly
  const headX = useTransform(p, [0, 1], reduce ? [0, 0] : [-30, 20]);

  // paragraph lights up word by word
  const { scrollYProgress: textP } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.5"] });
  const textProgress = useTransform(textP, (v) => (reduce ? 1 : v));

  // mouse tilt on the image
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 16 });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 80, damping: 16 });
  const rotateY = useTransform(() => cardRotY.get() + tiltY.get());
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <section ref={sectionRef} id="creativity" aria-labelledby="creativity-title" className="relative overflow-hidden py-24 lg:py-[170px]">
      <div className="container-site grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,505px)] lg:gap-10">
        {/* Copy */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10"
        >
          <motion.h2
            id="creativity-title"
            style={{ x: headX }}
            className="font-display text-[clamp(2.75rem,4.2vw,5rem)] font-bold uppercase leading-[1.02]"
          >
            <span className="block overflow-hidden pb-1">
              <motion.span variants={line} className="block origin-bottom-left">
                Creativity
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span variants={line} className="block origin-bottom-left">
                Without Limits.
              </motion.span>
            </span>
          </motion.h2>

          <p ref={textRef} className="mt-10 max-w-[610px] text-[clamp(1.25rem,1.4vw+0.5rem,2.125rem)] leading-[1.02]">
            {PARAGRAPH.map((w, i) => (
              <Word key={i} w={w} i={i} n={PARAGRAPH.length} progress={textProgress} />
            ))}
          </p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4 lg:mt-[42px]">
            <Link
              href="/about"
              className="group inline-flex h-[49px] items-center gap-7 rounded-full border border-white/10 bg-surface/80 pl-6 pr-[5px] text-base font-medium transition-colors duration-300 hover:border-grad-mid/50"
            >
              Learn More
              <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/contact"
              className="bg-brand-gradient group relative inline-flex h-[49px] items-center overflow-hidden rounded-full px-[34px] text-base font-medium shadow-[0_10px_40px_-12px_rgba(183,43,202,0.7)] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(233,110,216,0.8)]"
            >
              <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 blur-sm transition-[left] duration-700 ease-cinematic group-hover:left-[120%]" />
              <span className="relative">Start The Project</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-[505px] [perspective:1400px]">
          {/* frosted glass slab */}
          <motion.div
            aria-hidden
            style={{ rotate: glassRot, x: glassX, opacity: glassOpacity }}
            className="absolute -right-[38%] top-[-6%] h-[112%] w-[100%] rounded-[80px] bg-gradient-to-br from-white/[0.09] to-white/[0.03] blur-[6px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
          />
          <motion.div
            style={{ rotateY, rotateX: tiltX, rotate: cardRotZ, x: cardX, scale: cardScale, clipPath: cardClip }}
            className="relative aspect-[505/639] overflow-hidden rounded-[80px] shadow-[0_50px_120px_-30px_rgba(98,34,157,0.6)]"
          >
            <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
              <Image
                src="/images/showcase/software.webp"
                alt="Developer wearing a sensor cap reviewing a 3D model on multiple monitors"
                fill
                sizes="(min-width: 1024px) 505px, 90vw"
                className="object-cover"
                style={{ objectPosition: "30% 50%" }}
              />
            </motion.div>
            {/* soft light sweep */}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[sweep_8s_ease-in-out_infinite] motion-reduce:hidden" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
