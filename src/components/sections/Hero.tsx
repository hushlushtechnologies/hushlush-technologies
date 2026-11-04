"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import CountUp from "@/components/ui/CountUp";
import { useIntroReady } from "@/lib/intro";
import Statement from "./Statement";
import RotatingEarth from "@/components/ui/RotatingEarth";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Sparkle,
  Tiktok,
  Youtube,
} from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Convert a px value from the 1920px Figma frame into vw, so layers scale with the screen. */
const fvw = (px: number) => `${(px / 19.2).toFixed(3)}vw`;

/* ───────────────────────── Intro animation variants ───────────────────────── */

const intro: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

const lineReveal: Variants = {
  hidden: { y: "110%", rotate: 4 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE } },
};

const popIn: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: EASE } },
};

/* ───────────────────────────── Floating crystal ───────────────────────────── */

type CrystalProps = {
  src: string;
  alt?: string;
  /** Mouse parallax strength in px */
  depth: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  /** Scroll-driven transforms */
  scrollStyle: Record<string, MotionValue<number> | MotionValue<string>>;
  /** Position/size through CSS variables (mobile + desktop) */
  className: string;
  style: CSSProperties;
  introFrom: { x?: number | string; y?: number | string; rotate?: number };
  delay: number;
  floatClass?: string;
  priority?: boolean;
};

function Crystal({
  src,
  alt = "",
  depth,
  mouseX,
  mouseY,
  scrollStyle,
  className,
  style,
  introFrom,
  delay,
  floatClass = "animate-float",
  priority,
}: CrystalProps) {
  const ready = useIntroReady();
  const x = useTransform(mouseX, (v) => v * depth);
  const y = useTransform(mouseY, (v) => v * depth);

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute aspect-square", className)}
      style={{ ...style, x, y }}
    >
      <motion.div
        className="size-full will-change-transform"
        style={scrollStyle}
      >
        <motion.div
          className="size-full"
          initial={{ opacity: 0, scale: 0.6, ...introFrom }}
          animate={ready ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 } : undefined}
          transition={{ duration: 2.2, delay, ease: EASE }}
        >
          <div className={cn("relative size-full", floatClass)}>
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-contain"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────── Small pieces ─────────────────────────────── */

function StatCard({
  value,
  label,
  text,
  children,
}: {
  value: ReactNode;
  label: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <motion.article
      variants={popIn}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex min-h-[171px] flex-col justify-between rounded-[28px] bg-card p-5 text-ink shadow-[0_30px_80px_-30px_rgba(183,43,202,0.55)] lg:w-[204px]"
    >
      <div className="text-right">
        <p className="font-display text-[26px] font-bold leading-none text-purple">
          {value}
        </p>
        <h3 className="mt-2 text-base font-medium">{label}</h3>
      </div>
      <p className="mt-6 text-sm leading-[1.06]">{text}</p>
      {children}
    </motion.article>
  );
}

const socials = [
  {
    label: "Instagram",
    href: siteConfig.socials.instagram,
    Icon: Instagram,
    area: "col-start-2 row-start-1",
  },
  {
    label: "YouTube",
    href: siteConfig.socials.youtube,
    Icon: Youtube,
    area: "col-start-1 row-start-2",
  },
  {
    label: "TikTok",
    href: siteConfig.socials.tiktok,
    Icon: Tiktok,
    area: "col-start-3 row-start-2",
  },
  {
    label: "Facebook",
    href: siteConfig.socials.facebook,
    Icon: Facebook,
    area: "col-start-2 row-start-3",
  },
];

function SocialCluster() {
  const ready = useIntroReady();
  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-[repeat(3,64px)] grid-rows-[repeat(3,64px)] gap-2.5 lg:grid-cols-[repeat(3,75px)] lg:grid-rows-[repeat(3,75px)] lg:gap-[11px]"
    >
      {socials.map(({ label, href, Icon, area }, i) => (
        <motion.a
          key={label}
          href={href || "#"}
          target={href ? "_blank" : undefined}
          rel={href ? "noopener noreferrer" : undefined}
          aria-label={`Hushlush on ${label}`}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.8, delay: 1.9 + i * 0.1, ease: EASE }}
          whileHover={{ scale: 1.08 }}
          className={cn(
            "grid place-items-center rounded-2xl border border-white/[0.06] bg-surface/80 text-text-primary/90 backdrop-blur-sm transition-colors duration-300 hover:border-grad-mid/60 hover:text-text-primary hover:shadow-[0_0_30px_-6px_rgba(183,43,202,0.8)]",
            area,
          )}
        >
          <Icon className="size-[18px]" />
        </motion.a>
      ))}

      {/* Center logo mark with golden pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
        animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
        transition={{ duration: 1.2, delay: 1.7, ease: EASE }}
        className="relative col-start-2 row-start-2 grid place-items-center"
      >
        <span
          aria-hidden
          className="absolute size-14 animate-ping rounded-full bg-primary/10 [animation-duration:3s]"
        />
        <Image
          src="/images/logo-mark.svg"
          alt=""
          width={43}
          height={40}
          className="relative h-auto w-10 drop-shadow-[0_0_14px_rgba(233,224,42,0.45)] lg:w-[43px]"
        />
      </motion.div>
    </motion.div>
  );
}

function StoryCard() {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, x: 80, rotate: 4 },
        show: {
          opacity: 1,
          x: 0,
          rotate: 0,
          transition: { duration: 1.2, ease: EASE },
        },
      }}
      whileHover={{ y: -8 }}
      className="flex w-full max-w-[300px] flex-col rounded-[28px] bg-card p-3 text-center text-ink shadow-[0_40px_100px_-30px_rgba(183,43,202,0.6)] lg:min-h-[452px] lg:w-[224px]"
    >
      <div className="relative aspect-[284/212] overflow-hidden rounded-[20px]">
        <Image
          src="/images/hero/story-ai.webp"
          alt="Human hand reaching toward a robotic hand — AI and creativity"
          fill
          sizes="224px"
          className="object-cover transition-transform duration-700 ease-cinematic hover:scale-110"
        />
      </div>
      <h3 className="mt-5 font-display text-base font-bold text-purple">
        Success Story
      </h3>
      <p className="mt-2 text-sm">Built For Impact.</p>
      <Sparkle className="mx-auto mt-6 size-4 animate-pulse text-purple" />
      <blockquote className="mt-auto pt-6 text-left text-xs leading-[1.1]">
        Hush Lush Transformed Our Vision Into An Experience That Felt Bigger,
        Smarter And More Powerful Than We Imagined.
      </blockquote>
      <Image
        src="/images/hero/avatars.png"
        alt="Happy clients"
        width={166}
        height={62}
        className="mx-auto mt-4 h-[41px] w-auto"
      />
    </motion.article>
  );
}

/* ─────────────────────────────────── Hero ─────────────────────────────────── */

export default function Hero() {
  const ready = useIntroReady();
  const sectionRef = useRef<HTMLElement>(null);

  // The pinned cinematic scroll only runs on desktop with motion allowed.
  // On phones/tablets the hero scrolls normally so nothing fades while reading.
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Scroll progress through the pinned hero (0 → 1)
  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Mouse parallax (-0.5 → 0.5), smoothed with a spring
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!finePointer || reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  /*
   * Scroll timeline of the pinned stage (p: 0 → 1)
   *  0.00 – 0.25  hero content & cards leave
   *  0.05 – 0.55  bottom crystal flies up, flips and blurs into the statement pose
   *  0.25 – 0.50  globe zooms and fades out
   *  0.44 – 0.75  "We are more than an agency." reveals (Statement.tsx)
   *  0.75 – 1.00  hold
   */
  const contentY = useTransform(p, [0, 0.25], [0, -160]);
  const contentOpacity = useTransform(p, [0, 0.2], [1, 0]);
  const contentBlur = useTransform(p, [0, 0.2], ["blur(0px)", "blur(10px)"]);
  const bottomY = useTransform(p, [0, 0.28], [0, 220]);
  const bottomOpacity = useTransform(p, [0.03, 0.22], [1, 0]);

  const earthScale = useTransform(p, [0, 0.5], [1, 1.5]);
  const earthY = useTransform(p, [0, 0.5], ["0%", "-10%"]);
  const earthOpacity = useTransform(p, [0.25, 0.5], [1, 0]);
  const glowOpacity = useTransform(p, [0, 0.45], [1, 0]);

  const topCrystal = {
    y: useTransform(p, [0, 0.4], ["0vh", "-60vh"]),
    x: useTransform(p, [0, 0.4], ["0vw", "-15vw"]),
    rotate: useTransform(p, [0, 0.4], [0, -35]),
    scale: useTransform(p, [0, 0.4], [1, 1.4]),
    opacity: useTransform(p, [0.2, 0.4], [1, 0]),
  };
  const rightCrystal = {
    x: useTransform(p, [0, 0.4], ["0vw", "25vw"]),
    y: useTransform(p, [0, 0.4], ["0vh", "-15vh"]),
    rotate: useTransform(p, [0, 0.4], [0, 30]),
    scale: useTransform(p, [0, 0.4], [1, 1.6]),
    opacity: useTransform(p, [0.2, 0.4], [1, 0]),
  };
  // End pose matches the Figma "statement" frame: top-centre, flipped, blurred
  const bottomCrystal = {
    y: useTransform(
      p,
      [0.05, 0.55],
      ["calc(0vh + 0vw)", "calc(-84vh + 3.54vw)"],
    ),
    x: useTransform(p, [0.05, 0.55], ["0vw", "2.9vw"]),
    rotate: useTransform(p, [0.05, 0.55], [0, 200]),
    scale: useTransform(p, [0.05, 0.3, 0.55], [1, 1.6, 1.05]),
    filter: useTransform(
      p,
      [0.05, 0.3, 0.55],
      ["blur(0px)", "blur(3px)", "blur(4px)"],
    ),
  };

  return (
    <>
      <section
        ref={sectionRef}
        id="home"
        aria-labelledby="hero-title"
        className="relative motion-safe:lg:h-[400vh]"
      >
        <div className="relative min-h-dvh overflow-hidden lg:h-dvh lg:min-h-[840px] motion-safe:lg:sticky motion-safe:lg:top-0">
          {/* ── Background glows ── */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={pinned ? { opacity: glowOpacity } : undefined}
          >
            <div className="absolute -left-[15%] -top-[25%] h-[80%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(120,120,30,0.35),transparent)] blur-3xl" />
            <div className="absolute left-[30%] top-[5%] h-[90%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(102,34,159,0.55),transparent)] blur-3xl" />
          </motion.div>

          {/* ── Globe ── */}
          <motion.div
            aria-hidden
            initial={{ y: "35%", opacity: 0 }}
            animate={ready ? { y: "0%", opacity: 1 } : undefined}
            transition={{ duration: 2.4, delay: 0.1, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-0"
          >
            <motion.div
              style={
                pinned
                  ? { scale: earthScale, y: earthY, opacity: earthOpacity }
                  : undefined
              }
              className="relative origin-bottom"
            >
              {/* Live rotating globe (WebGL) — keeps turning even when the mouse is idle */}
              <RotatingEarth className="left-1/2 w-full min-w-[1100px] max-w-none -translate-x-1/2" />
              {/* Darken the continents so the globe sits back like in the design */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_18%,rgba(30,8,48,0.55)_38%,rgba(6,5,8,0.88)_75%,#060508_100%)]" />
            </motion.div>
          </motion.div>

          {/* ── Crystals ── */}
          <Crystal
            src="/images/hero/crystal-top.webp"
            depth={-40}
            mouseX={mouseX}
            mouseY={mouseY}
            scrollStyle={pinned ? topCrystal : {}}
            introFrom={{ y: -220, x: -120, rotate: -35 }}
            delay={0.3}
            priority
            className="left-[var(--m-x)] top-[var(--m-y)] w-[var(--m-s)] lg:left-[var(--x)] lg:top-[var(--y)] lg:w-[var(--s)]"
            style={
              {
                "--x": fvw(118),
                "--y": fvw(-380),
                "--s": fvw(760),
                "--m-x": "max(-28vw, -150px)",
                "--m-y": "max(-46vw, -250px)",
                "--m-s": "min(95vw, 500px)",
              } as CSSProperties
            }
          />
          <Crystal
            src="/images/hero/crystal-right.webp"
            depth={-70}
            mouseX={mouseX}
            mouseY={mouseY}
            scrollStyle={pinned ? rightCrystal : {}}
            introFrom={{ x: 200, rotate: 25 }}
            delay={0.6}
            floatClass="animate-float-slow"
            className="right-[var(--m-x)] top-[var(--m-y)] w-[var(--m-s)] lg:right-[var(--x)] lg:top-[var(--y)] lg:w-[var(--s)]"
            style={
              {
                "--x": fvw(-298),
                "--y": fvw(-180),
                "--s": fvw(600),
                "--m-x": "max(-38vw, -190px)",
                "--m-y": "8vw",
                "--m-s": "min(70vw, 400px)",
              } as CSSProperties
            }
          />
          <Crystal
            src="/images/hero/crystal-bottom.webp"
            depth={55}
            mouseX={mouseX}
            mouseY={mouseY}
            scrollStyle={pinned ? bottomCrystal : {}}
            introFrom={{ y: 260, rotate: 20 }}
            delay={0.45}
            priority
            floatClass="animate-float-slow"
            className="bottom-[var(--m-y)] left-[var(--m-x)] w-[var(--m-s)] lg:bottom-[var(--y)] lg:left-[var(--x)] lg:w-[var(--s)]"
            style={
              {
                "--x": fvw(525),
                "--y": fvw(-332),
                "--s": fvw(800),
                "--m-x": "5vw",
                "--m-y": "max(-55vw, -340px)",
                "--m-s": "min(110vw, 640px)",
              } as CSSProperties
            }
          />

          {/* ── Content ── */}
          <motion.div
            variants={intro}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            className="container-site relative z-10 flex min-h-dvh flex-col pb-14 pt-32 lg:h-full lg:min-h-0 lg:pb-[clamp(48px,14.8vh,160px)] lg:pt-[clamp(150px,23.8vh,257px)]"
          >
            {/* Top row */}
            <motion.div
              style={
                pinned
                  ? {
                      y: contentY,
                      opacity: contentOpacity,
                      filter: contentBlur,
                    }
                  : undefined
              }
              className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"
            >
              <div>
                <h1
                  id="hero-title"
                  className="font-display text-display font-bold uppercase"
                >
                  <span className="block overflow-hidden pb-1">
                    <motion.span
                      variants={lineReveal}
                      className="block origin-bottom-left"
                    >
                      We Build
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-1">
                    <motion.span
                      variants={lineReveal}
                      className="block origin-bottom-left"
                    >
                      What&rsquo;s Next.
                    </motion.span>
                  </span>
                </h1>

                <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center lg:mt-[35px] lg:gap-[25px]">
                  <motion.div variants={fadeUp}>
                    <Link
                      href="#services"
                      className="group inline-flex h-[49px] w-fit items-center gap-10 rounded-full border border-white/10 bg-surface/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-colors duration-300 hover:border-grad-mid/50"
                    >
                      Explore Our Service
                      <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px] group-hover:shadow-[0_0_24px_rgba(233,110,216,0.7)]">
                        <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </motion.div>
                  <motion.p
                    variants={fadeUp}
                    className="text-body max-w-[265px] text-text-primary/90"
                  >
                    A Creative Technology Company Combining Strategy, Design,
                    Media And Digital Experiences To Help Ambitious Brands Grow.
                  </motion.p>
                </div>
              </div>

              <motion.p
                variants={fadeUp}
                className="text-body max-w-[170px] text-text-primary/90 lg:mt-[-6px] lg:w-[170px]"
              >
                We Turn Bold Ideas Into Digital Experiences That Drive Real
                Growth.
              </motion.p>
            </motion.div>

            <div className="min-h-12 flex-1 lg:hidden" />

            {/* Bottom row — pinned to the bottom on desktop so it can sit beside the headline */}
            <motion.div
              style={
                pinned ? { y: bottomY, opacity: bottomOpacity } : undefined
              }
              className="flex flex-col gap-10 lg:absolute lg:inset-x-[clamp(1.25rem,5.5vw,5rem)] lg:bottom-[clamp(48px,14.8vh,160px)] lg:flex-row lg:items-end lg:justify-between"
            >
              <motion.div
                variants={intro}
                className="grid grid-cols-2 gap-3 sm:max-w-[440px] lg:flex lg:gap-6"
              >
                <StatCard
                  value={<CountUp to={85} prefix="+" suffix="%" delay={1.6} start={ready} />}
                  label="Digital Growth"
                  text="Stronger Digital Performance Through Smarter Strategy."
                />
                <StatCard
                  value={
                    <CountUp to={2.4} decimals={1} suffix="x" delay={1.75} start={ready} />
                  }
                  label="Conversion Rate"
                  text="Experiences Engineered To Turn Attention Into Action."
                />
              </motion.div>

              <motion.div
                variants={intro}
                className="flex flex-col items-center gap-10 sm:flex-row sm:items-end sm:justify-between lg:justify-end lg:gap-[42px]"
              >
                {/* on small laptops (1024–1279) there isn't room for all three blocks in one row */}
                <div className="lg:max-xl:hidden">
                  <SocialCluster />
                </div>
                <StoryCard />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scene 2 — the statement, scrubbed by the same scroll */}
          {pinned && <Statement progress={p} />}
        </div>
      </section>

      {/* Phones / tablets / reduced motion: statement as a normal section */}
      {!pinned && <Statement />}
    </>
  );
}
