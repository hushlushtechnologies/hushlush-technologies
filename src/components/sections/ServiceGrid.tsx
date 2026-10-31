"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { serviceHref } from "@/lib/navigation";
import { ArrowRight } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

type Service = {
  title: string;
  category: string;
  img: string;
  alt: string;
  objectPosition?: string;
  wide?: boolean;
};

const SERVICES: Service[] = [
  {
    title: "Branding & Identity",
    category: "Branding & Identity",
    img: "/images/services/branding.webp",
    alt: "Raw rock transforming step by step into a glowing glass cube",
  },
  {
    title: "Digital Marketing",
    category: "Digital Marketing",
    img: "/images/services/digital.webp",
    alt: "Social media icons feeding into a rising growth chart",
  },
  {
    title: "Production Service",
    category: "Production Service",
    img: "/images/services/production.webp",
    alt: "Figure walking down a neon film-strip road into the stars",
  },
  {
    title: "Creative Solution",
    category: "Creative Solution",
    img: "/images/services/creative.webp",
    alt: "Robot on a laptop surrounded by design tool icons",
  },
  {
    title: "Software Solution",
    category: "Software Solution",
    img: "/images/services/software.webp",
    alt: "Hooded developer surrounded by walls of glowing code",
  },
  {
    title: "2D / 3D Motion / VFX Solution",
    category: "2D / 3D Motion / VFX",
    img: "/images/services/motion.webp",
    alt: "Hand shaping fiery 3D graphics on holographic screens",
    objectPosition: "50% 42%",
  },
  {
    title: "Advertisement Solution",
    category: "Advertisement Solution",
    img: "/images/services/ads.webp",
    alt: "Large purple billboard on a city building at dusk",
    objectPosition: "50% 45%",
    wide: true,
  },
];

/* ───────────────────────── Card ───────────────────────── */

const letters: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.022, delayChildren: 0.15 } },
};
const letter: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const side = service.wide ? 0 : index % 2 === 0 ? -1 : 1;

  /* Scroll-scrubbed entrance: card swings up from below while its image "opens" */
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const e = useSpring(enter, { stiffness: 120, damping: 24, mass: 0.4 });
  const y = useTransform(e, [0, 1], reduce ? [0, 0] : [140, 0]);
  const x = useTransform(e, [0, 1], reduce ? [0, 0] : [side * 60, 0]);
  const rotateX = useTransform(e, [0, 1], reduce ? [0, 0] : [28, 0]);
  const rotateZ = useTransform(e, [0, 1], reduce ? [0, 0] : [side * 4, 0]);
  const opacity = useTransform(e, [0, 0.5], reduce ? [1, 1] : [0, 1]);
  const clipPath = useTransform(e, (v) => {
    const t = reduce ? 1 : Math.min(1, Math.max(0, (v - 0.15) / 0.85));
    return service.wide
      ? `inset(0% ${(1 - t) * 50}% 0% ${(1 - t) * 50}% round 14px)` // opens from the centre
      : `inset(${(1 - t) * 100}% 0% 0% 0% round 14px)`; // curtain rises
  });

  /* Image parallax across the full pass */
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(pass, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);
  const imgScale = useTransform(e, [0, 1], reduce ? [1.15, 1.15] : [1.45, 1.15]);

  /* Hover: 3D tilt + spotlight following the mouse */
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 160, damping: 18 });
  const tiltY = useSpring(useTransform(px, [0, 1], [-5, 5]), { stiffness: 160, damping: 18 });
  const onMove = (ev: PointerEvent<HTMLAnchorElement>) => {
    if (ev.pointerType !== "mouse") return;
    const r = ev.currentTarget.getBoundingClientRect();
    const fx = (ev.clientX - r.left) / r.width;
    const fy = (ev.clientY - r.top) / r.height;
    px.set(fx);
    py.set(fy);
    ev.currentTarget.style.setProperty("--mx", `${fx * 100}%`);
    ev.currentTarget.style.setProperty("--my", `${fy * 100}%`);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.li
      ref={ref}
      className={cn("[perspective:1400px]", service.wide && "md:col-span-2")}
      style={{ y, x, rotateX, rotate: rotateZ, opacity, transformOrigin: "50% 100%" }}
    >
      <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="h-full motion-reduce:!transform-none">
        <Link
          href={serviceHref(service.category)}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="group relative block h-full overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0e0a12] p-3 transition-[border-color,box-shadow] duration-500 hover:border-white/15 hover:shadow-[0_40px_100px_-40px_rgba(183,43,202,0.7)] sm:p-4"
        >
          {/* Animated gradient border on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-60%] -z-0 animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_72%,rgba(233,110,216,0.55)_82%,rgba(233,224,42,0.5)_86%,transparent_94%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:animate-none"
          />
          <span aria-hidden className="pointer-events-none absolute inset-px rounded-[21px] bg-[#0e0a12]" />

          {/* Image */}
          <motion.div
            style={{ clipPath }}
            className={cn("relative overflow-hidden rounded-[14px]", service.wide ? "aspect-[16/9] md:aspect-[1094/317]" : "aspect-[514/317]")}
          >
            <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
              <Image
                src={service.img}
                alt={service.alt}
                fill
                sizes={service.wide ? "(min-width: 768px) 1100px, 100vw" : "(min-width: 768px) 560px, 100vw"}
                className="object-cover transition-transform duration-[1.4s] ease-cinematic group-hover:scale-110"
                style={{ objectPosition: service.objectPosition }}
              />
            </motion.div>
            {/* periodic light sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[sweep_7s_ease-in-out_infinite] motion-reduce:hidden"
              style={{ animationDelay: `${index * 0.9}s` }}
            />
            {/* mouse spotlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.45), transparent 60%)" }}
            />
            {/* "Explore" chip */}
            <span className="absolute bottom-3 right-3 flex translate-y-3 items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-xs font-medium opacity-0 backdrop-blur-md transition-all duration-500 ease-cinematic group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm">
              Explore
              <ArrowRight className="size-4" />
            </span>
          </motion.div>

          {/* Title — letters rise in */}
          <div className="relative flex justify-center pb-3 pt-6 sm:pb-4 sm:pt-7">
            <motion.h3
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              variants={letters}
              aria-label={service.title}
              className="relative text-center font-display text-lg font-bold uppercase tracking-wide text-primary sm:text-[22px]"
            >
              {service.title.split(" ").map((word, wi, arr) => (
                <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                  {word.split("").map((ch, ci) => (
                    <span key={ci} className="inline-block overflow-hidden align-bottom">
                      <motion.span variants={letter} className="inline-block">
                        {ch}
                      </motion.span>
                    </span>
                  ))}
                  {wi < arr.length - 1 && " "}
                </span>
              ))}
              <span className="bg-brand-gradient absolute -bottom-1.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full transition-all duration-500 ease-cinematic group-hover:w-full" />
            </motion.h3>
          </div>
        </Link>
      </motion.div>
    </motion.li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export default function ServiceGrid() {
  return (
    <section id="all-services" aria-labelledby="all-services-title" className="relative py-24 lg:py-[200px]">
      <h2 id="all-services-title" className="sr-only">
        Our Services
      </h2>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_50%_45%,rgba(60,15,100,0.35),transparent_75%)]" />
      <ul className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-[clamp(1.25rem,5.5vw,5rem)] md:grid-cols-2 md:gap-x-[40px] md:gap-y-[40px] xl:px-0">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.title} service={s} index={i} />
        ))}
      </ul>
    </section>
  );
}
