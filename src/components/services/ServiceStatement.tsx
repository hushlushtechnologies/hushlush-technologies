"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import type { ServicePage } from "@/lib/services";

const EASE = [0.22, 1, 0.36, 1] as const;

/** "a [[b c]] d" → [{w:"a"},{w:"b",hi:true},{w:"c",hi:true},{w:"d"}] */
function parse(text: string) {
  const out: { w: string; hi: boolean }[] = [];
  text.split(/(\[\[.*?\]\])/).forEach((chunk) => {
    const hi = chunk.startsWith("[[");
    chunk
      .replace(/^\[\[|\]\]$/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ w, hi }));
  });
  return out;
}

function Word({ w, hi, i, n, p }: { w: string; hi: boolean; i: number; n: number; p: MotionValue<number> }) {
  const start = 0.32 + (i / n) * 0.5;
  const end = start + 0.5 / n + 0.02;
  const opacity = useTransform(p, [start, end], [0.16, 1]);
  const color = useTransform(p, [start, end], ["#f6f2fa", hi ? "#E9E02A" : "#f6f2fa"]);
  const blur = useTransform(p, [start, end], ["blur(3px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, color, filter: blur }} className="inline-block">
      {w}&nbsp;
    </motion.span>
  );
}

export default function ServiceStatement({ data }: { data: ServicePage["statement"] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setPinned(mq.matches);
    const raf = requestAnimationFrame(on);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", on);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: pinned ? ["start 0.6", "end end"] : ["start 0.9", "end 0.6"],
  });
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const p = useTransform(sp, (v) => (reduce ? 1 : v));

  // ribbon pours down from the top, then keeps drifting
  const ribbonClip = useTransform(p, [0, 0.4], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const ribbonY = useTransform(p, [0, 1], ["-6%", "4%"]);
  const ribbonRot = useTransform(p, [0, 1], [-6, 4]);
  const ribbonScale = useTransform(p, [0, 0.4, 1], [1.15, 1, 1.04]);
  const titleY = useTransform(p, [0, 1], ["10%", "-12%"]);
  // "rise": the visual lifts up into frame instead of pouring down
  const rise = data.image.motion === "rise";
  const riseY = useTransform(p, [0, 0.45, 1], ["35%", "0%", "-3%"]);
  const riseO = useTransform(p, [0, 0.3], [0, 1]);
  const riseScale = useTransform(p, [0, 0.45], [0.85, 1]);
  const box = data.image.box;

  const words = parse(data.paragraph);

  return (
    <section ref={ref} aria-labelledby="svc-statement" className="relative lg:h-[230vh]">
      <div className="relative overflow-hidden py-20 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:items-center lg:pb-0 lg:pt-16">
        {/* ambient glow */}
        <div aria-hidden className="pointer-events-none absolute left-[30%] top-1/2 size-[70vmax] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(102,34,159,0.3),transparent)]" />

        <div className="container-site relative w-full">
          {/* stage scales with height on short screens so the whole composition fits */}
          <div className="relative w-full [container-type:inline-size] lg:max-w-[calc((100dvh-7rem)*1.364)]">
            <div className="relative lg:h-[73.3cqw]">
              {/* ribbon */}
              <motion.div
                aria-hidden
                style={
                  rise
                    ? ({ y: riseY, opacity: riseO, scale: riseScale, "--l": `${box?.left ?? 26.6}cqw`, "--t": `${box?.top ?? 0}cqw`, "--w": `${box?.w ?? 47}cqw` } as unknown as CSSProperties)
                    : ({ clipPath: ribbonClip, y: ribbonY, rotate: ribbonRot, scale: ribbonScale, "--l": `${box?.left ?? 26.6}cqw`, "--t": `${box?.top ?? 0}cqw`, "--w": `${box?.w ?? 47}cqw` } as unknown as CSSProperties)
                }
                className="pointer-events-none absolute left-[18%] top-[2%] w-[70%] lg:left-[var(--l)] lg:top-[var(--t)] lg:w-[var(--w)]"
              >
                <motion.div
                  animate={reduce ? undefined : rise ? { y: [0, -8, 0] } : { skewX: [0, 2.5, 0, -2.5, 0], y: [0, -10, 0] }}
                  transition={{ duration: rise ? 6 : 10, repeat: Infinity, ease: "easeInOut" }}
                  className="relative max-lg:opacity-45"
                >
                  {rise && (
                    <motion.div
                      aria-hidden
                      animate={reduce ? undefined : { opacity: [0.45, 0.9, 0.45], scale: [0.95, 1.08, 0.95] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-[8%] top-[-6%] h-[52%] w-[84%] rounded-[30%] bg-[radial-gradient(closest-side,rgba(183,43,202,0.55),transparent)] blur-2xl"
                    />
                  )}
                  <div className={cn("relative", rise && "[mask-image:linear-gradient(to_bottom,black_75%,transparent)]")}>
                  <Image
                    src={data.image.src}
                    alt=""
                    width={data.image.width}
                    height={data.image.height}
                    sizes="(min-width:1024px) 47vw, 70vw"
                    className={rise ? cn("relative h-auto w-full", data.image.tint && "brightness-[0.6] contrast-[1.1]") : "h-auto w-full motion-safe:animate-[iris_11s_ease-in-out_infinite]"}
                  />
                  {data.image.tint && (
                    /* brand-purple grade, clipped to the image shape */
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[#6a22c0] opacity-65 mix-blend-color"
                      style={{ WebkitMaskImage: `url(${data.image.src})`, maskImage: `url(${data.image.src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
                    />
                  )}
                  </div>
                </motion.div>
              </motion.div>

              {/* heading */}
              <motion.h2
                id="svc-statement"
                style={{ y: titleY }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                className="relative pt-[10%] font-display text-[clamp(1.8rem,6cqw,5rem)] font-bold uppercase leading-[1.03] tracking-[-0.01em] lg:absolute lg:left-0 lg:top-[7.6cqw] lg:whitespace-nowrap lg:pt-0"
              >
                {data.title.map((t, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.04em]">
                    <motion.span
                      className="block"
                      variants={{
                        hidden: { y: "110%", rotate: 3 },
                        show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE, delay: i * 0.12 } },
                      }}
                    >
                      {t}
                    </motion.span>
                  </span>
                ))}
              </motion.h2>

              {/* paragraph — words light up as you scroll, key phrase turns yellow */}
              <p className="relative mt-[40%] max-w-[967px] text-[clamp(1.35rem,3.1cqw,2.6rem)] leading-[1.1] lg:absolute lg:left-[24.3cqw] lg:top-[43.9cqw] lg:mt-0 lg:w-[75.5cqw]">
                <span className="sr-only">{data.paragraph.replace(/\[\[|\]\]/g, "")}</span>
                <span aria-hidden>
                  {words.map((wd, i) => (
                    <Word key={i} {...wd} i={i} n={words.length} p={p} />
                  ))}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
