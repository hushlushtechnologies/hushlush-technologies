"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { serviceHref } from "@/lib/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Figma frame: 1920 × 1302. Boxes are [x, y, w, h] in that frame. */
const FW = 1920;
const FH = 1302;
const X = (v: number) => `${((v / FW) * 100).toFixed(3)}%`;
const Y = (v: number) => `${((v / FH) * 100).toFixed(3)}%`;

type Item = {
  id: string;
  label: string;
  href: string;
  img: string;
  alt: string;
  box: [number, number, number, number];
  labelAt: [number, number];
  radius: number; // px in the frame
  objectPosition?: string;
  z: number;
  depth: number; // mouse/scroll parallax strength
  order: number; // fly-out order
};

const BIG: Item = {
  id: "software",
  label: "Software Solution",
  href: serviceHref("Software Solution"),
  img: "/images/showcase/software.webp",
  alt: "Developer at a desk working on a 3D model across multiple monitors",
  box: [708, 333, 505, 637],
  labelAt: [705, 277],
  radius: 72,
  objectPosition: "28% 50%",
  z: 2,
  depth: 10,
  order: 0,
};

const ITEMS: Item[] = [
  {
    id: "branding",
    label: "Branding & Identity",
    href: serviceHref("Branding & Identity"),
    img: "/images/showcase/branding.webp",
    alt: "Amber dropper bottle against swirling orange canyon rock",
    box: [405, 433, 223, 277],
    labelAt: [405, 388],
    radius: 34,
    objectPosition: "50% 62%",
    z: 1,
    depth: 26,
    order: 1,
  },
  {
    id: "digital",
    label: "Digital Marketing",
    href: serviceHref("Digital Marketing"),
    img: "/images/showcase/fashion.webp",
    alt: "Fashion model in blue tipping her hat under a spotlight",
    box: [1249, 373, 222, 186],
    labelAt: [1249, 585],
    radius: 34,
    objectPosition: "50% 16%",
    z: 1,
    depth: 30,
    order: 2,
  },
  {
    id: "app",
    label: "Application Development",
    href: serviceHref("Software Solution", "Mobile App Development"),
    img: "/images/showcase/fashion.webp",
    alt: "Blue-lit fashion portrait",
    box: [1366, 633, 222, 186],
    labelAt: [1366, 843],
    radius: 34,
    objectPosition: "50% 16%",
    z: 1,
    depth: 22,
    order: 3,
  },
  {
    id: "creative",
    label: "Creative Solutions",
    href: serviceHref("Creative Solution"),
    img: "/images/showcase/creative.webp",
    alt: "Holographic high-heel shoe floating above a tablet with Buy Now buttons",
    box: [582, 870, 251, 202],
    labelAt: [396, 870],
    radius: 40,
    z: 1,
    depth: 34,
    order: 4,
  },
  {
    id: "motion",
    label: "2D / 3D Motion / VFX",
    href: serviceHref("2D / 3D Motion / VFX"),
    img: "/images/showcase/studio.webp",
    alt: "Motorcycle rider in a photo studio surrounded by softbox lights",
    box: [1071, 835, 282, 270],
    labelAt: [877, 1071],
    radius: 48,
    objectPosition: "50% 55%",
    z: 3,
    depth: 18,
    order: 5,
  },
  {
    id: "ads",
    label: "Advertisement Solution",
    href: serviceHref("Advertisement Solution"),
    img: "/images/showcase/studio.webp",
    alt: "Studio motorcycle shoot",
    box: [1411, 921, 145, 138],
    labelAt: [1411, 1079],
    radius: 26,
    objectPosition: "50% 60%",
    z: 1,
    depth: 38,
    order: 6,
  },
];

const ALL = [BIG, ...ITEMS];
const bigCx = BIG.box[0] + BIG.box[2] / 2;
const bigCy = BIG.box[1] + BIG.box[3] / 2;

/* ───────────────────────── Desktop: one card on the stage ───────────────────────── */

function StageCard({
  item,
  progress,
  mx,
  my,
  stageW,
}: {
  item: Item;
  progress: MotionValue<number>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  stageW: MotionValue<number>;
}) {
  const [x, y, w, h] = item.box;
  const isBig = item.id === BIG.id;

  // Fly-out window for this card
  const start = isBig ? 0 : 0.1 + item.order * 0.045;
  const end = isBig ? 0.32 : start + 0.3;

  // Start stacked behind the big card, then fly to the Figma position
  const dx = ((bigCx - (x + w / 2)) / FW) * 100;
  const dy = ((bigCy - (y + h / 2)) / FH) * 100;
  const k = useTransform(progress, [start, end], [0, 1], { ease: (t) => 1 - Math.pow(1 - t, 3) });
  const tx = useTransform(() => ((1 - k.get()) * dx * stageW.get()) / 100);
  const ty = useTransform(() => ((1 - k.get()) * dy * stageW.get() * (FH / FW)) / 100);
  const rot = useTransform(progress, [start, end], [isBig ? -6 : (item.order % 2 ? -14 : 12), 0]);
  const scale = useTransform(progress, [start, end], [isBig ? 0.72 : 0.55, 1]);
  const opacity = useTransform(progress, [start, start + 0.06], [isBig ? 0.4 : 0, 1]);

  // After landing: gentle drift by depth
  const drift = useTransform(progress, [end, 1], [0, -item.depth * 1.2]);
  const imgScale = useTransform(progress, [start, Math.min(1, end + 0.25)], [1.35, 1]);

  // Mouse parallax
  const px = useTransform(mx, (v) => v * item.depth);
  const py = useTransform(my, (v) => v * item.depth);

  return (
    <motion.div
      className="absolute"
      style={{ left: X(x), top: Y(y), width: X(w), height: Y(h), zIndex: item.z, x: tx, y: ty, rotate: rot, scale, opacity }}
    >
      <motion.div className="size-full" style={{ x: px, y: py, translateY: drift }}>
        <Link
          href={item.href}
          aria-label={item.label}
          className="group relative block size-full overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-[box-shadow] duration-500 hover:shadow-[0_30px_90px_-20px_rgba(183,43,202,0.6)]"
          style={{ borderRadius: `${(item.radius / FW) * 100}cqw` }}
        >
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            <Image
              src={item.img}
              alt={item.alt}
              fill
              sizes={isBig ? "(min-width:1024px) 27vw, 90vw" : "(min-width:1024px) 15vw, 45vw"}
              className="object-cover transition-transform duration-[1.2s] ease-cinematic group-hover:scale-110"
              style={{ objectPosition: item.objectPosition }}
            />
          </motion.div>
          {/* sheen on hover */}
          <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/15 blur-md transition-[left] duration-1000 ease-cinematic group-hover:left-[130%]" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-0" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function StageLabel({ item, progress, mx, my }: { item: Item; progress: MotionValue<number>; mx: MotionValue<number>; my: MotionValue<number> }) {
  const isBig = item.id === BIG.id;
  const end = isBig ? 0.32 : 0.1 + item.order * 0.045 + 0.3;
  const reveal = useTransform(progress, [end - 0.04, end + 0.06], [0, 1]);
  const clipPath = useTransform(reveal, (v) => `inset(0 ${(1 - v) * 100}% 0 0 round 10px)`);
  const y = useTransform(reveal, [0, 1], [12, 0]);
  const drift = useTransform(progress, [end, 1], [0, -item.depth * 1.2]);
  const px = useTransform(mx, (v) => v * item.depth * 1.15);
  const py = useTransform(my, (v) => v * item.depth * 1.15);

  return (
    <motion.div className="absolute z-10" style={{ left: X(item.labelAt[0]), top: Y(item.labelAt[1]), x: px, y: py, translateY: drift }}>
      <motion.div style={{ clipPath, y, opacity: reveal }}>
        <Link
          href={item.href}
          className="group inline-flex items-center gap-0 whitespace-nowrap hover:gap-2 rounded-[10px] border border-white/10 bg-[#0e0a14]/85 px-[0.75cqw] py-[0.35cqw] font-display text-[max(11px,0.9cqw)] font-medium text-primary backdrop-blur-md transition-colors duration-300 hover:border-primary/50 hover:bg-[#1a1224]"
        >
          <span className="h-1.5 w-0 rounded-full bg-primary opacity-0 shadow-[0_0_8px_#e9e02a] transition-all duration-300 group-hover:w-1.5 group-hover:opacity-100" />
          {item.label}
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Mobile / tablet grid ───────────────────────── */

function MobileShowcase() {
  return (
    <div className="container-site grid grid-cols-2 gap-x-3 gap-y-6 py-20 sm:gap-x-5">
      {ALL.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 50, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: (i % 2) * 0.1, ease: EASE }}
          className={cn(item.id === BIG.id && "col-span-2")}
        >
          <Link href={item.href} className="group block">
            <span className="mb-2 inline-flex rounded-[10px] border border-white/10 bg-[#0e0a14] px-3 py-1.5 font-display text-xs font-medium text-primary sm:text-sm">
              {item.label}
            </span>
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl ring-1 ring-white/10",
                item.id === BIG.id ? "aspect-[4/3]" : "aspect-[5/4]"
              )}
            >
              <Image
                src={item.img}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-active:scale-105"
                style={{ objectPosition: item.objectPosition }}
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Scroll progress across the pinned stage (fully assembled when motion is reduced)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useMotionValue(reduce ? 1 : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce) progress.set(v);
  });
  useEffect(() => {
    progress.set(reduce ? 1 : scrollYProgress.get());
  }, [reduce, progress, scrollYProgress]);

  // Mouse parallax (-0.5…0.5), smoothed
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

  // Stage width in px (fly-out distances scale with it)
  const stageRef = useRef<HTMLDivElement>(null);
  const stageW = useMotionValue(1600);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => stageW.set(el.clientWidth));
    ro.observe(el);
    stageW.set(el.clientWidth);
    return () => ro.disconnect();
  }, [desktop, stageW]);

  // Background pieces
  const glassRotate = useTransform(progress, [0, 1], [-18, 6]);
  const glassScale = useTransform(progress, [0, 0.4], [0.6, 1]);
  const glassOpacity = useTransform(progress, [0.05, 0.35], [0, 1]);
  const crystalRY = useTransform(progress, [0, 1], ["-25%", "10%"]);
  const crystalRR = useTransform(progress, [0, 1], [-20, 25]);
  const crystalLY = useTransform(progress, [0, 1], ["30%", "-8%"]);
  const crystalLR = useTransform(progress, [0, 1], [25, -10]);
  const glassX = useTransform(mx, (v) => v * -30);
  const crystalMX = useTransform(mx, (v) => v * -60);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      aria-labelledby="showcase-title"
      className="relative lg:h-[270vh]"
    >
      <h2 id="showcase-title" className="sr-only">
        Our Work Across Every Service
      </h2>

      {/* Mobile & tablet */}
      {!desktop && <MobileShowcase />}

      {/* Desktop pinned stage */}
      {desktop && (
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_55%_at_48%_55%,rgba(60,15,100,0.55),transparent_75%)]" />

          {/* Stage keeps the Figma aspect ratio and fits the viewport */}
          <div
            ref={stageRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [container-type:size]"
            style={{ width: "min(100vw, 100dvh * 1.6)", aspectRatio: `${FW} / ${FH}` } as CSSProperties}
          >
            {/* Blurred crystals */}
            <motion.div
              aria-hidden
              className="absolute"
              style={{ left: X(1560), top: Y(-80), width: X(560), aspectRatio: "1", y: crystalRY, rotate: crystalRR, x: crystalMX }}
            >
              <Image src="/images/hero/crystal-right.webp" alt="" fill sizes="30vw" className="object-contain opacity-90 blur-[10px]" />
            </motion.div>
            <motion.div
              aria-hidden
              className="absolute z-20"
              style={{ left: X(-170), top: Y(820), width: X(620), aspectRatio: "1", y: crystalLY, rotate: crystalLR }}
            >
              <Image src="/images/hero/crystal-top.webp" alt="" fill sizes="32vw" className="object-contain" />
            </motion.div>

            {/* Frosted glass panel behind the cards */}
            <motion.div
              aria-hidden
              className="absolute rounded-[5cqw] border border-white/10 bg-white/[0.06] backdrop-blur-[2px]"
              style={{ left: X(800), top: Y(300), width: X(600), height: Y(700), rotate: glassRotate, scale: glassScale, opacity: glassOpacity, x: glassX }}
            />

            {ALL.map((item) => (
              <StageCard key={item.id} item={item} progress={progress} mx={mx} my={my} stageW={stageW} />
            ))}
            {ALL.map((item) => (
              <StageLabel key={`l-${item.id}`} item={item} progress={progress} mx={mx} my={my} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
