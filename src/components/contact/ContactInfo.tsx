"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { siteConfig } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Icons ───────────────────────── */

const Mail = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.6L4 7.4V8l8 5 8-5v-.6l-8 5.2Z" />
  </svg>
);
const Phone = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
  </svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
    <path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7Zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5Z" />
  </svg>
);

type Item = { Icon: () => ReactNode; title: string; value: string; href: string; external?: boolean };

const ITEMS: Item[] = [
  { Icon: Mail, title: "Email", value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
  { Icon: Phone, title: "Call Us", value: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}` },
  { Icon: Pin, title: "Visit Us", value: siteConfig.contact.address, href: siteConfig.contact.mapUrl, external: true },
];

const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(
  "Al Zarouni Business Center, Al Barsha 1, Dubai",
)}&z=13&output=embed`;

/* ───────────────────────── Card ───────────────────────── */

const card: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -25, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};

function InfoCard({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  const { Icon } = item;
  return (
    <motion.li variants={card} className="[perspective:1000px]">
      <a
        ref={ref}
        href={item.href}
        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ "--mx": "50%", "--my": "50%", "--rx": "0deg", "--ry": "0deg" } as CSSProperties}
        className="group relative flex h-full gap-5 md:min-h-[148px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f0b14]/90 p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out [transform:rotateX(var(--rx))_rotateY(var(--ry))] [transform-style:preserve-3d] hover:border-transparent hover:shadow-[0_20px_60px_-20px_rgba(183,43,202,0.55)] hover:[background:linear-gradient(#0f0b14,#0f0b14)_padding-box,linear-gradient(270deg,#E96ED8,#B72BCA_50.12%,#62229D)_border-box] lg:gap-10"
      >
        {/* cursor spotlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(260px circle at var(--mx) var(--my), rgba(183,43,202,0.18), transparent 70%)" }}
        />
        {/* idle sheen sweeping across, staggered per card */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)] motion-safe:animate-[sweep_6s_ease-in-out_infinite]"
          style={{ animationDelay: `${index * 1.2 + 1}s` }}
        />

        <span className="relative grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/40 text-text-primary transition-all duration-500 [transform:translateZ(30px)] group-hover:border-grad-mid/60 group-hover:bg-brand-gradient group-hover:shadow-[0_0_24px_rgba(233,110,216,0.6)]">
          <span aria-hidden className="absolute inset-0 rounded-lg border border-grad-mid/50 motion-safe:animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: `${index * 0.6}s` }} />
          <Icon />
        </span>
        <span className="relative min-w-0 [transform:translateZ(20px)]">
          <span className="block text-lg font-medium sm:text-xl">{item.title}</span>
          <span className="mt-2 block max-w-[260px] text-[15px] leading-[1.25] break-words text-text-primary/85 transition-colors group-hover:text-text-primary">
            {item.value.replace("@", "@\u200b")}
          </span>
        </span>
      </a>
    </motion.li>
  );
}

/* ───────────────────────── Section ───────────────────────── */

const TITLE = "Contact Us";

export default function ContactInfo() {
  const ref = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  // background glow breathes in as the section arrives
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glow = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.2, 1, 1, 0.3]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [0.7, 1]);

  // map opens like a screen powering on, then drifts in parallax
  const { scrollYProgress: mp } = useScroll({ target: mapRef, offset: ["start end", "start 0.45"] });
  const m = useSpring(mp, { stiffness: 80, damping: 20, mass: 0.4 });
  const clip = useTransform(m, (v) => {
    if (reduce) return "inset(0% 0% 0% 0% round 24px)";
    const x = (1 - v) * 18;
    const y = (1 - v) * 42;
    return `inset(${y}% ${x}% ${y}% ${x}% round 24px)`;
  });
  const mapTilt = useTransform(m, [0, 1], reduce ? [0, 0] : [28, 0]);
  const mapScale = useTransform(m, [0, 1], reduce ? [1, 1] : [1.25, 1]);
  const scanY = useTransform(m, [0, 1], ["-10%", "110%"]);
  const scanOpacity = useTransform(m, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      id="contact-details"
      aria-labelledby="contact-us-title"
      className="relative overflow-hidden py-[clamp(5rem,12vw,13rem)]"
    >
      {/* purple ambient glow */}
      <motion.div
        aria-hidden
        style={{ opacity: glow, scale: glowScale }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[110%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(102,34,159,0.38),rgba(60,12,90,0.18)_40%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-[clamp(1.25rem,5.5vw,2rem)] xl:px-0">
        <motion.h2
          id="contact-us-title"
          aria-label={TITLE}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="text-center font-display text-[clamp(2.5rem,4.2vw,5rem)] font-bold leading-none tracking-[-0.01em]"
        >
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: "70%", rotateX: -80, filter: "blur(10px)" },
                show: { opacity: 1, y: "0%", rotateX: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
              }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.h2>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } } }}
          className="mt-[clamp(2.5rem,4vw,4.5rem)] grid gap-5 md:grid-cols-2 lg:gap-[38px] xl:grid-cols-3"
        >
          {ITEMS.map((item, i) => (
            <InfoCard key={item.title} item={item} index={i} />
          ))}
        </motion.ul>

        {/* Map */}
        <div ref={mapRef} className="mt-[clamp(2.5rem,3.5vw,3.25rem)] [perspective:1400px]">
          <motion.div
            style={{ clipPath: clip, rotateX: mapTilt }}
            className="relative h-[clamp(280px,31vw,400px)] origin-top overflow-hidden rounded-3xl bg-[#1a1a1a]"
          >
            <motion.iframe
              title={`Map — ${siteConfig.contact.address}`}
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ scale: mapScale }}
              className="absolute inset-0 size-full border-0 [filter:grayscale(1)_invert(0.9)_contrast(0.85)_brightness(0.95)]"
            />
            {/* brand tint + edge vignette */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#2a0b45] mix-blend-color opacity-40" />
            <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_50px_10px_rgba(6,5,8,0.6)]" />

            {/* location beacon */}
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-grad-start/40 motion-safe:animate-[ping_2.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <span className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grad-mid/25 blur-md" />
              <span className="relative block size-4 rounded-full bg-brand-gradient shadow-[0_0_20px_6px_rgba(233,110,216,0.7)] ring-4 ring-white/15" />
            </div>

            {/* scan line while it powers on */}
            <motion.div
              aria-hidden
              style={{ top: scanY, opacity: scanOpacity }}
              className="pointer-events-none absolute inset-x-0 h-24 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(233,110,216,0.18),transparent)]"
            >
              <span className="absolute inset-x-0 top-1/2 h-px bg-grad-start/70 shadow-[0_0_12px_rgba(233,110,216,0.9)]" />
            </motion.div>

            <a
              href={siteConfig.contact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-medium backdrop-blur-md transition-colors hover:border-grad-mid/60"
            >
              Open in Google Maps ↗
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
