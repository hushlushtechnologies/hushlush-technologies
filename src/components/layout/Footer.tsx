"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { siteConfig } from "@/lib/site";
import { serviceHref } from "@/lib/navigation";
import { Facebook, Instagram, Tiktok, Youtube } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const CELL = 130; // grid size in px (matches the design)
const COPYRIGHT_YEAR = 2026; // update yearly (a live date would break static prerendering)

const EXPLORE = [
  { label: "Home", href: "/" },
  { label: "Service", href: "/#services" },
  { label: "Work", href: "/#showcase" },
  { label: "About", href: "/about" },
];

const SERVICES = [
  ["Branding & Identity", "Branding & Identity"],
  ["Digital Marketing", "Digital Marketing"],
  ["Production Service", "Production Service"],
  ["Creative Solution", "Creative Solution"],
  ["Software Solution", "Software Solution"],
  ["2D / 3D Motion / VFX Solution", "2D / 3D Motion / VFX"],
  ["Advertisement Solution", "Advertisement Solution"],
] as const;

const MEDIA = [
  { label: "Instagram", Icon: Instagram, href: siteConfig.socials.instagram },
  { label: "Facebook", Icon: Facebook, href: siteConfig.socials.facebook },
  { label: "TikTok", Icon: Tiktok, href: siteConfig.socials.tiktok },
  { label: "YouTube", Icon: Youtube, href: siteConfig.socials.youtube },
];

/* ───────────────────────── Icons for contact ───────────────────────── */

const Phone = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
  </svg>
);
const Mail = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.6L4 7.4V8l8 5 8-5v-.6l-8 5.2Z" />
  </svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
    <path d="M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7Zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5Z" />
  </svg>
);

const CONTACT = [
  { Icon: Phone, label: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}` },
  { Icon: Mail, label: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
  { Icon: Pin, label: siteConfig.contact.address, href: siteConfig.contact.mapUrl },
];

/* ───────────────────────── Animated grid background ───────────────────────── */

function GridBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [cells, setCells] = useState<{ left: number; top: number; id: number }[]>([]);

  // random cells glow softly, like the lit squares in the design
  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const timer = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const cols = Math.ceil(el.clientWidth / CELL);
      const rows = Math.ceil(el.clientHeight / CELL);
      const offset = ((el.clientWidth / 2) % CELL) - CELL; // grid is centred horizontally
      const cell = {
        left: offset + Math.floor(Math.random() * (cols + 1)) * CELL,
        top: Math.floor(Math.random() * rows) * CELL - 2,
        id: id++,
      };
      setCells((c) => [...c.slice(-5), cell]);
    }, 900);
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* grid lines (fade toward edges) */}
      <div
        className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(70%_80%_at_50%_45%,#000_30%,transparent_85%)]"
        style={{ backgroundSize: `${CELL}px ${CELL}px`, backgroundPosition: "center -2px" }}
      />
      {/* lit cells */}
      {cells.map((c) => (
        <motion.span
          key={c.id}
          className="absolute bg-gradient-to-b from-white/[0.07] to-transparent"
          style={{ width: CELL, height: CELL, left: c.left, top: c.top }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, ease: "easeInOut" }}
        />
      ))}
      {/* mouse spotlight (position set by the footer) */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 [.group\/footer:hover_&]:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--fx,50%) var(--fy,50%), rgba(183,43,202,0.16), transparent 65%)" }}
      />
    </div>
  );
}

/* ───────────────────────── Pieces ───────────────────────── */

const col: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-lg font-semibold text-text-primary/45 lg:text-xl">{children}</h2>;
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group relative inline-block text-base leading-tight text-text-primary/95 transition-colors hover:text-primary lg:text-lg">
      {children}
      <span className="bg-brand-gradient absolute -bottom-1 left-0 h-px w-0 transition-all duration-500 ease-cinematic group-hover:w-full" />
    </Link>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-[#15111b] transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:border-grad-mid/60 group-hover:shadow-[0_0_20px_-4px_rgba(183,43,202,0.8)]">
      {children}
    </span>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

export default function Footer() {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--fx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--fy", `${e.clientY - r.top}px`);
  };

  return (
    <footer onPointerMove={onMove} className="group/footer relative overflow-hidden border-t border-white/[0.06] bg-background">
      <GridBackground />

      <div className="container-site relative pt-24 lg:pt-[120px]">
        {/* Logo + tagline */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.7, filter: "blur(10px)" },
              show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
            }}
          >
            <Link href="/" aria-label="Hush Lush Technologies — Home">
              <Image src="/images/logo.svg" alt="Hush Lush Technologies" width={128} height={45} className="h-auto w-[200px] lg:w-[250px]" />
            </Link>
          </motion.div>
          <p className="mt-8 font-display text-[clamp(1.875rem,2.6vw,2.75rem)] font-medium leading-[1.15]">
            {["Make Something", "Worth Remembering"].map((l) => (
              <span key={l} className="block overflow-hidden">
                <motion.span
                  className="block"
                  variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1, ease: EASE } } }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </p>
        </motion.div>

        {/* Columns */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 pb-20 md:grid-cols-[1fr_1.1fr_1.2fr_1.4fr] lg:mt-[68px] lg:pb-[120px]"
        >
          <motion.nav variants={col} aria-label="Explore">
            <Heading>Explore</Heading>
            <ul className="mt-6 space-y-5">
              {EXPLORE.map((l) => (
                <motion.li key={l.label} variants={item}>
                  <TextLink href={l.href}>{l.label}</TextLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav variants={col} aria-label="Services">
            <Heading>Service</Heading>
            <ul className="mt-6 space-y-5">
              {SERVICES.map(([label, cat]) => (
                <motion.li key={label} variants={item} className="max-w-[170px]">
                  <TextLink href={serviceHref(cat)}>{label}</TextLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.div variants={col}>
            <Heading>Media</Heading>
            <ul className="mt-6 space-y-[18px]">
              {MEDIA.map(({ label, Icon, href }) => (
                <motion.li key={label} variants={item}>
                  <a
                    href={href || "#"}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 text-base text-text-primary/95 transition-colors hover:text-primary lg:text-lg"
                  >
                    <IconTile>
                      <Icon className="size-[18px]" />
                    </IconTile>
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.address variants={col} className="col-span-2 not-italic md:col-span-1">
            <Heading>Get in Touch</Heading>
            <ul className="mt-6 space-y-[18px]">
              {CONTACT.map(({ Icon, label, href }) => (
                <motion.li key={label} variants={item}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-3 text-base leading-snug text-text-primary/95 transition-colors hover:text-primary lg:text-lg"
                  >
                    <span className="text-primary">
                      <IconTile>
                        <Icon />
                      </IconTile>
                    </span>
                    <span className="min-w-0 break-words pt-2">{label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.address>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative bg-[#120e1c]">
        <div className="container-site flex flex-col gap-3 py-6 text-sm text-text-primary/55 md:flex-row md:items-center md:justify-between lg:text-base">
          <p>
            © {COPYRIGHT_YEAR} Hush Lush Technologies. All Rights Reserved. Designed by:{" "}
            <span className="text-text-primary/90">Hush Lush Technologies</span>
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy-policy" className="transition-colors hover:text-text-primary">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="transition-colors hover:text-text-primary">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
