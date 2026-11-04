"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Card boxes on the 1920 frame, relative to the 1280-wide content column (1cqw = 12.8px) */
const BOXES = [
  { left: 0, top: 0, w: 45.9, from: -1 },
  { left: 54.1, top: 0, w: 45.9, from: 1 },
  { left: 0, top: 19, w: 26.1, from: -1 },
  { left: 74.3, top: 18.9, w: 26.1, from: 1 },
  { left: 67.6, top: 38.1, w: 32.3, from: 1 },
];
/* 6-step layout: an extra card bottom-left (Software page) */
const BOXES_6 = [...BOXES.slice(0, 4), { left: 0, top: 38.2, w: 32.4, from: -1 }, BOXES[4]];

const stepAt = (i: number) => 0.14 + i * 0.15;

function StepCard({
  step,
  i,
  p,
  active,
  done,
  desktop,
  total,
}: {
  step: NonNullable<ServicePage["process"]>["steps"][number];
  i: number;
  p: MotionValue<number>;
  active: boolean;
  done: boolean;
  desktop: boolean;
  total: number;
}) {
  const box = (total === 6 ? BOXES_6 : BOXES)[i] ?? BOXES[i % BOXES.length];
  const t = stepAt(i);
  const opacity = useTransform(p, [t - 0.06, t + 0.02], [0, 1]);
  const x = useTransform(p, [t - 0.06, t + 0.04], [box.from * 80, 0]);
  const blur = useTransform(p, [t - 0.06, t + 0.03], ["blur(10px)", "blur(0px)"]);

  const body = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-[18px] border bg-[#0f0b14]/95 px-4 py-[18px] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-700",
        active
          ? "border-transparent shadow-[0_24px_70px_-25px_rgba(183,43,202,0.85)] [background:linear-gradient(#120c19,#120c19)_padding-box,linear-gradient(270deg,#E96ED8,#B72BCA_50.12%,#62229D)_border-box]"
          : "border-white/[0.07]",
      )}
    >
      {/* progress shimmer while active */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(233,110,216,0.14),transparent)] transition-opacity duration-500",
          active ? "opacity-100 motion-safe:animate-[sweep_3.5s_ease-in-out_infinite]" : "opacity-0",
        )}
      />
      <p className="relative flex items-center gap-2 font-display text-lg font-medium text-primary">
        {String(i + 1).padStart(2, "0")}
        <span className={cn("h-px origin-left bg-primary/60 transition-[width] duration-700", active ? "w-10" : "w-0")} />
      </p>
      <h3 className="relative mt-1 font-display text-[clamp(1.5rem,2.2cqw,1.75rem)] font-bold leading-tight">{step.title}</h3>
      <p className="relative mt-2 text-base text-text-primary/55">{step.tagline}</p>
      <p className={cn("relative mt-4 text-base leading-[1.1] transition-colors duration-500", active || done ? "text-text-primary" : "text-text-primary/70")}>{step.text}</p>
    </div>
  );

  if (!desktop) {
    return (
      <motion.li
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {body}
      </motion.li>
    );
  }

  return (
    <motion.li
      style={{ left: `${box.left}cqw`, top: `${box.top}cqw`, width: `${box.w}cqw`, opacity, x, filter: blur }}
      className={cn("absolute transition-[scale] duration-700", active ? "z-20 scale-[1.02]" : "z-10")}
    >
      {body}
    </motion.li>
  );
}

export default function ServiceProcess({ data }: { data: NonNullable<ServicePage["process"]> }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px) and (min-height: 700px)");
    const on = () => setDesktop(mq.matches);
    const raf = requestAnimationFrame(on);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", on);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const p = useTransform(sp, (v) => (reduce || !desktop ? 1 : v));

  useMotionValueEvent(p, "change", (v) => {
    let a = -1;
    data.steps.forEach((_, i) => {
      if (v >= stepAt(i)) a = i;
    });
    if (v >= 0.95) a = -2; // all done → everything lit evenly
    setActive(a);
  });

  /* head: rises in, then the visor scan follows the active step */
  const headY = useTransform(p, [0, 0.14], ["30%", "0%"]);
  const headO = useTransform(p, [0, 0.1], [0, 1]);
  const headScale = useTransform(p, [0, 0.14, 1], [0.85, 1, 1.04]);
  const scanY = useTransform(p, [0.14, 0.88], ["4%", "72%"]);
  const scanO = useTransform(p, [0.1, 0.16, 0.8, 0.9], [0, 1, 1, 0]);
  const glow = useTransform(p, [0.1, 0.5, 0.95], [0.3, 0.8, 1]);

  /* mouse tilt */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 60, damping: 15 });
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 60, damping: 15 });
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const head = (
    <motion.div style={desktop ? { y: headY, opacity: headO, scale: headScale } : undefined} className="relative [perspective:1000px]">
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative">
        {/* aura */}
        <motion.div
          aria-hidden
          style={{ opacity: glow, background: `radial-gradient(closest-side, ${data.image.glow ?? "rgba(255,90,40,0.28)"}, rgba(183,43,202,0.22) 55%, transparent)` }}
          className="absolute inset-x-[-20%] top-[-5%] h-[85%] rounded-full blur-2xl"
        />
        <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative">
          <Image
            src={data.image.src}
            alt={data.image.alt}
            width={data.image.width}
            height={data.image.height}
            sizes="(min-width:1024px) 430px, 70vw"
            className={cn("h-auto w-full", data.image.tint ? (data.image.dim === false ? "brightness-[0.62] contrast-[1.15]" : "brightness-[0.45] [mask-image:radial-gradient(closest-side,black_70%,transparent)]") : "[mask-image:linear-gradient(to_bottom,black_80%,transparent)]")}
          />
          {data.image.tint && (
            <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-color"
              style={{ background: data.image.tint, WebkitMaskImage: `url(${data.image.src})`, maskImage: `url(${data.image.src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
            />
            {data.image.dim === false && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent via-[#0a0610]/80 to-[#060508]"
                style={{ WebkitMaskImage: `url(${data.image.src})`, maskImage: `url(${data.image.src})`, WebkitMaskSize: "100% 182%", maskSize: "100% 182%", WebkitMaskPosition: "bottom", maskPosition: "bottom" }}
              />
            )}
            {data.image.dim !== false && <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(6,5,8,0.35),rgba(6,5,8,0.75))]"
              style={{ WebkitMaskImage: `url(${data.image.src})`, maskImage: `url(${data.image.src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
            />}
            </>
          )}
          {/* scanning light across the face, clipped to the head shape */}
          {!reduce && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{ WebkitMaskImage: `url(${data.image.src})`, maskImage: `url(${data.image.src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
            >
              <motion.div
                style={desktop ? { top: scanY, opacity: scanO } : undefined}
                animate={desktop ? undefined : { top: ["5%", "70%", "5%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 h-[14%] -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,170,110,0.45),rgba(233,110,216,0.4),transparent)]"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <section ref={ref} onPointerMove={onMove} aria-labelledby="process-title" className={cn("relative", desktop && "h-[340vh]")}>
      <div className={cn("relative overflow-hidden py-24", desktop && "sticky top-0 flex h-dvh flex-col items-center justify-center py-0 pt-16")}>
        <motion.h2
          id="process-title"
          initial={{ opacity: 0, y: 40, letterSpacing: "0.2em", filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: "0em", filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="container-site text-center font-display text-[clamp(2.75rem,4.3vw,5.25rem)] font-bold uppercase leading-none"
        >
          {data.title}
        </motion.h2>

        {/* progress dots */}
        <div aria-hidden className={cn("mt-6 justify-center gap-2", desktop ? "flex" : "hidden")}>
          {data.steps.map((_, i) => (
            <span key={i} className={cn("h-1 rounded-full transition-all duration-500", active === i ? "bg-brand-gradient w-8" : active === -2 || i < active ? "w-3 bg-grad-mid/70" : "w-3 bg-white/15")} />
          ))}
        </div>

        <div className={cn("container-site relative w-full", desktop ? "mt-[clamp(2rem,5vh,5rem)]" : "mt-12")}>
          {desktop ? (
            <div className="relative mx-auto w-full [container-type:inline-size] lg:max-w-[calc((100dvh-16rem)*1.8)]">
              <div className="relative h-[55.5cqw]">
                <div
                  className="absolute"
                  style={{ left: `${data.image.box?.left ?? 33.2}cqw`, top: `${data.image.box?.top ?? 6.25}cqw`, width: `${data.image.box?.w ?? 33.6}cqw` }}
                >
                  {head}
                </div>
                <ol className="contents">
                  {data.steps.map((s, i) => (
                    <StepCard key={s.title} step={s} i={i} p={p} active={active === i} done={active === -2 || i < active} desktop total={data.steps.length} />
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-[min(70vw,360px)]">{head}</div>
              <ol className="mt-10 grid gap-4 sm:grid-cols-2">
                {data.steps.map((s, i) => (
                  <StepCard key={s.title} step={s} i={i} p={p} active={false} done desktop={false} total={data.steps.length} />
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
