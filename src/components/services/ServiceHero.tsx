"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { useIntroReady } from "@/lib/intro";
import { ArrowRight } from "@/components/ui/icons";
import type { ServicePage } from "@/lib/services";
import SocialOrbit from "@/components/services/SocialOrbit";
import SoftwareStage from "@/components/services/SoftwareStage";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Positions measured on the 1920 frame; the content column is 1280 wide → 1cqw = 12.8px */

const line: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1, ease: EASE, delay: 0.25 + i * 0.12 } }),
};
const fade: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: (d: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE, delay: d } }),
};

export default function ServiceHero({ data }: { data: ServicePage["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const ready = useIntroReady();
  const state = ready || reduce ? "show" : "hidden";

  /* scroll: blob turns and sinks, ghost words drift apart */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });
  const s = useTransform(sp, (v) => (reduce ? 0 : v));
  const blobY = useTransform(s, [0, 1], ["0%", "35%"]);
  const unspool = data.image.motion === "unspool";
  const holo = data.image.motion === "hologram" || data.image.motion === "billboard";
  const iris = !data.image.motion || data.image.motion === "spin";
  const blobRot = useTransform(s, [0, 1], [0, unspool ? 8 : holo ? 0 : 28]);
  const box = data.image.box ?? { left: 51.4, top: 16.8, w: 47 };
  const blobScale = useTransform(s, [0, 1], [1, 0.82]);
  const ghostA = useTransform(s, [0, 1], ["0%", "-35%"]);
  const ghostB = useTransform(s, [0, 1], ["0%", "30%"]);
  const copyY = useTransform(s, [0, 1], ["0%", "-30%"]);
  const copyO = useTransform(s, [0, 0.6], [1, 0]);

  /* mouse: blob tilts in 3D, light follows */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [16, -16]), { stiffness: 60, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-20, 20]), { stiffness: 60, damping: 14 });
  const sheenX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const sheenY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);
  const sheen = useTransform([sheenX, sheenY], ([x, y]) => `radial-gradient(40% 40% at ${x} ${y}, rgba(255,255,255,0.75), transparent 70%)`);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const maskStyle = {
    WebkitMaskImage: `url(${data.image.src})`,
    maskImage: `url(${data.image.src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  } as CSSProperties;

  return (
    <section ref={ref} onPointerMove={onMove} aria-labelledby="svc-title" className="relative overflow-hidden pb-24 pt-[clamp(7.5rem,12vw,14.5rem)] lg:pb-[clamp(4rem,8vw,10rem)]">
      {/* corner light beams + ambient glow */}
      <div aria-hidden className="pointer-events-none absolute -left-[12%] -top-[30%] h-[110%] w-[34%] rotate-[-38deg] bg-[linear-gradient(90deg,transparent,rgba(120,60,200,0.28),rgba(233,224,42,0.08),transparent)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-[10%] -top-[20%] h-[90%] w-[22%] rotate-[-38deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)] blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -right-[15%] top-[45%] size-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(102,34,159,0.35),transparent)]" />

      <div className="container-site relative">
        <div className="relative [container-type:inline-size]">
        <div className="lg:grid lg:[grid-template-areas:'s']">
          {/* ── Copy ── */}
          <motion.div style={{ y: copyY, opacity: copyO }} className="relative z-10 lg:self-start lg:[grid-area:s]">
            <motion.p
              variants={fade}
              custom={0.1}
              initial="hidden"
              animate={state}
              className="inline-flex h-[clamp(40px,4.1cqw,53px)] items-center rounded-xl border border-white/10 bg-white/[0.03] px-[clamp(1rem,1.8cqw,1.5rem)] font-display text-[clamp(1rem,1.8cqw,1.4rem)] font-medium text-primary backdrop-blur-sm"
            >
              <span className="relative">
                {data.tag}
                <span aria-hidden className="absolute -inset-x-2 inset-y-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(233,224,42,0.25),transparent)] motion-safe:animate-[sweep_5s_ease-in-out_infinite]" />
              </span>
            </motion.p>

            <h1 id="svc-title" className="mt-[clamp(1rem,1.6cqw,1.25rem)] font-display text-[clamp(2.5rem,4.85cqw,3.9rem)] font-bold uppercase leading-[0.98] tracking-[-0.01em]">
              {data.title.map((t, i) => (
                <span key={i} className="block overflow-hidden pb-[0.06em]">
                  <motion.span className="block" variants={line} custom={i} initial="hidden" animate={state}>
                    {t}
                  </motion.span>
                </span>
              ))}
            </h1>

            <div className="mt-[clamp(1.75rem,3.4cqw,2.75rem)] flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-[clamp(1.5rem,2cqw,1.75rem)]">
              <motion.div variants={fade} custom={0.75} initial="hidden" animate={state}>
                <Link
                  href={data.cta.href}
                  className="group inline-flex h-[49px] items-center gap-6 rounded-full border border-white/10 bg-[#0f0b14]/80 pl-6 pr-[5px] text-base font-medium backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-grad-mid/50 hover:shadow-[0_0_30px_-4px_rgba(183,43,202,0.7)]"
                >
                  {data.cta.label}
                  <span className="bg-brand-gradient grid h-[39px] w-[55px] place-items-center rounded-full transition-all duration-500 ease-cinematic group-hover:w-[64px]">
                    <ArrowRight className="size-5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
              <motion.p variants={fade} custom={0.9} initial="hidden" animate={state} className="max-w-[290px] text-sm leading-[1.15] text-text-primary/85">
                {data.intro}
              </motion.p>
            </div>
          </motion.div>

          {/* ── Stage: ghost words + blob ── */}
          <div className="relative mt-10 aspect-[1/0.95] lg:mt-0 lg:aspect-auto lg:h-[60cqw] lg:[grid-area:s]">
            {/* ghost words */}
            <div aria-hidden className="pointer-events-none absolute inset-0 select-none font-display font-bold uppercase leading-none text-white/[0.07]">
              <motion.span
                style={{ x: ghostA }}
                initial={{ opacity: 0, x: -80 }}
                animate={state === "show" ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 1.4, delay: 0.6, ease: EASE }}
                className="absolute left-[2%] top-[22%] text-[22cqw] lg:left-[10%] lg:top-[30.8cqw] lg:text-[9.8cqw]"
              >
                {data.ghost[0]}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 80 }}
                animate={state === "show" ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 1.4, delay: 0.75, ease: EASE }}
                className="absolute left-[20%] top-[48%] text-[22cqw] lg:left-[var(--gx)] lg:top-[41.6cqw] lg:text-[9.8cqw]"
                style={{ x: ghostB, "--gx": `${data.ghostX ?? 46.4}cqw` } as unknown as CSSProperties}
              >
                {data.ghost[1]}
              </motion.span>
            </div>

            {data.image.motion === "depth" && data.image.depth ? (
              <motion.div
                style={{ y: blobY, "--l": `${box.left}cqw`, "--t": `${box.top}cqw`, "--w": `${box.w}cqw` } as unknown as CSSProperties}
                className="absolute left-1/2 top-[2%] w-[100%] -translate-x-1/2 lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[var(--w)] lg:translate-x-0"
              >
                <SoftwareStage
                  play={state === "show"}
                  progress={s}
                  mx={mx}
                  my={my}
                  model={{
                    src: data.image.src,
                    depthSrc: data.image.depth.src,
                    alt: data.image.alt,
                    aspect: data.image.height / data.image.width,
                    depthSize: data.image.depth.size,
                    strength: 0.34,
                    rotY: [-0.22, 0.38],
                    rotX: [0.06, -0.08],
                    scale: [1, 0.92],
                    ambient: 0.95,
                    diffuse: 0.55,
                    widen: 1.25,
                    sizes: "(min-width:1024px) 640px, 100vw",
                  }}
                />
              </motion.div>
            ) : data.image.motion === "orbit" ? (
              <motion.div
                style={{ y: blobY, scale: blobScale, "--l": `${box.left}cqw`, "--t": `${box.top}cqw`, "--w": `${box.w}cqw` } as unknown as CSSProperties}
                className="absolute left-1/2 top-[4%] w-[96%] -translate-x-1/2 [perspective:1200px] lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[var(--w)] lg:translate-x-0"
              >
                <SocialOrbit play={state === "show"} logo={data.image.src} rx={rx} ry={ry} />
              </motion.div>
            ) : data.image.frame ? (
              <>
            {/* logo inside a design-tool selection frame */}
              <motion.div
                style={{ y: blobY }}
                className="absolute left-1/2 top-[8%] aspect-[676/458] w-[94%] -translate-x-1/2 lg:left-[46.2cqw] lg:top-[20.5cqw] lg:w-[52.7cqw] lg:translate-x-0"
              >
                {/* frame lines open out from the centre */}
                <motion.svg
                  viewBox="0 0 676 458"
                  preserveAspectRatio="none"
                  aria-hidden
                  className="absolute inset-0 size-full overflow-visible"
                  initial={{ clipPath: "inset(50% 50% 50% 50%)", opacity: 0 }}
                  animate={state === "show" ? { clipPath: "inset(-5% -5% -5% -5%)", opacity: 1 } : undefined}
                  transition={{ duration: 1.1, delay: 0.4, ease: EASE }}
                >
                  <g fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeDasharray="9 6" vectorEffect="non-scaling-stroke">
                    <rect x="9" y="9" width="658" height="440" className="motion-safe:animate-[ants_1.6s_linear_infinite]" />
                    <rect x="28" y="28" width="620" height="402" className="motion-safe:animate-[ants_1.6s_linear_infinite_reverse]" />
                  </g>
                </motion.svg>
                {/* corner handles */}
                {[
                  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
                  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
                  "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
                  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
                ].map((pos, i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    initial={{ scale: 0, rotate: 90 }}
                    animate={state === "show" ? { scale: 1, rotate: 0 } : undefined}
                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 1.2 + i * 0.08 }}
                    className={`absolute ml-[1.3%] mt-[1.9%] size-[2.7%] min-h-2.5 min-w-2.5 bg-[#d9d9d9] shadow-[0_0_10px_rgba(255,255,255,0.4)] ${pos.replace("right-0", "right-[2.6%]").replace("bottom-0", "bottom-[3.8%]")}`}
                  />
                ))}
  
                <motion.div
                  initial={{ opacity: 0, y: -60, scale: 1.35, filter: "blur(16px)" }}
                  animate={state === "show" ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : undefined}
                  transition={{ type: "spring", stiffness: 120, damping: 13, delay: 1.45 }}
                  className="absolute left-[22.6%] top-[10.7%] w-[51.2%] [perspective:1000px]"
                >
                  <motion.div style={{ rotateX: rx, rotateY: ry, rotate: blobRot, scale: blobScale }} className="relative">
                    <motion.div
                      aria-hidden
                      animate={reduce ? undefined : { opacity: [0.35, 0.7, 0.35] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(233,190,60,0.35),transparent)] blur-2xl"
                    />
                    <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative">
                      <Image src={data.image.src} alt={data.image.alt} width={data.image.width} height={data.image.height} priority sizes="(min-width:1024px) 27vw, 48vw" className="h-auto w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" />
                      {/* metallic glint following the cursor + a periodic sweep */}
                      <motion.div aria-hidden className="absolute inset-0 mix-blend-overlay" style={{ ...maskStyle, background: sheen }} />
                      <div aria-hidden className="absolute inset-0 overflow-hidden" style={maskStyle}>
                        <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,240,200,0.7),transparent)] mix-blend-overlay motion-safe:animate-[sweep_4.5s_ease-in-out_infinite]" />
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
  
              </>
            ) : (
              <>
            {/* blob */}
            <motion.div
              style={{ y: blobY, rotate: blobRot, scale: blobScale, "--l": `${box.left}cqw`, "--t": `${box.top}cqw`, "--w": `${box.w}cqw` } as unknown as CSSProperties}
              className={`absolute left-1/2 -translate-x-1/2 lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[var(--w)] lg:translate-x-0 ${unspool ? "top-[-10%] w-[62%]" : "top-[6%] w-[88%]"}`}
            >
              <motion.div
                initial={
                  unspool
                    ? { opacity: 0, clipPath: "inset(0% 0% 100% 0%)", y: -40 }
                    : holo
                      ? { opacity: 0, y: 80, scaleY: 0.2, filter: "blur(20px) brightness(2.5)" }
                      : { opacity: 0, scale: 0.4, rotate: -120, filter: "blur(30px)" }
                }
                animate={
                  state === "show"
                    ? unspool
                      ? { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0 }
                      : holo
                        ? { opacity: [0, 1, 0.35, 1, 0.6, 1], y: 0, scaleY: 1, filter: "blur(0px) brightness(1)" }
                        : { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }
                    : undefined
                }
                transition={{ duration: unspool ? 2.2 : 1.8, delay: 0.35, ease: EASE }}
                style={holo ? { transformOrigin: "50% 85%" } : undefined}
                className="[perspective:1200px]"
              >
                <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative [transform-style:preserve-3d]">
                  {/* glow */}
                  <motion.div
                    aria-hidden
                    animate={reduce ? undefined : { opacity: [0.55, 0.9, 0.55], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(183,43,202,0.55),rgba(102,34,159,0.25)_60%,transparent)] blur-2xl [transform:translateZ(-60px)]"
                  />
                  <motion.div
                    animate={reduce ? undefined : unspool ? { y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5], skewY: [0, 1.5, 0] } : holo ? { y: [0, -14, 0] } : { y: [0, -16, 0], rotate: [0, 4, 0] }}
                    transition={{ duration: unspool ? 8 : 7, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Image
                      src={data.image.src}
                      alt={data.image.alt}
                      width={data.image.width}
                      height={data.image.height}
                      priority
                      sizes="(min-width:1024px) 47vw, 88vw"
                      className={iris ? "h-auto w-full motion-safe:animate-[iris_9s_ease-in-out_infinite]" : "h-auto w-full"}
                    />
                    {/* liquid sheen that follows the cursor, clipped to the shape */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 mix-blend-overlay"
                      style={{
                        ...maskStyle,
                        background: sheen,
                      }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
