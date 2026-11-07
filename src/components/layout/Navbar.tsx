"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { useIntroReady } from "@/lib/intro";
import { mainNav } from "@/lib/navigation";
import { ChevronDown, Menu } from "@/components/ui/icons";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const pathname = usePathname();
  const introReady = useIntroReady();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compact, blurred navbar after the user starts scrolling
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  const openServices = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);
  const closeServicesSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 160);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : href === "/#services" ? pathname.startsWith("/services") : pathname.startsWith(href);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={introReady ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        {/* Background appears once scrolled */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b transition-all duration-500",
            scrolled || servicesOpen
              ? "border-white/5 bg-background/95 lg:bg-background/70 backdrop-blur-xl"
              : "border-transparent bg-transparent"
          )}
        />

        <div
          className={cn(
            "container-site relative flex items-center justify-between transition-[height] duration-500 ease-cinematic",
            scrolled ? "h-[72px] lg:h-20" : "h-[84px] lg:h-[120px] 2xl:h-[170px]"
          )}
        >
          {/* Logo */}
          <Link href="/" aria-label="Hushlush Technologies — Home" className="relative z-10 shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Hushlush Technologies"
              width={128}
              height={45}
              priority
              className="h-9 w-auto lg:h-[45px]"
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-surface/80 p-1.5 backdrop-blur-md">
              {mainNav.map((item) => {
                const active = isActive(item.href);
                const pill = cn(
                  "relative flex h-9 items-center gap-1.5 rounded-full px-5 text-sm transition-colors duration-300",
                  active ? "text-ink" : "text-text-primary/85 hover:text-text-primary"
                );
                const activeBg = active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                );

                if (item.label === "Services") {
                  return (
                    <li key={item.label} onMouseEnter={openServices} onMouseLeave={closeServicesSoon}>
                      <button
                        type="button"
                        className={cn(pill, "isolate")}
                        aria-expanded={servicesOpen}
                        aria-controls="mega-menu"
                        onClick={() => setServicesOpen((o) => !o)}
                      >
                        {activeBg}
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-300",
                            servicesOpen && "rotate-180"
                          )}
                        />
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(pill, "isolate")}
                      aria-current={active ? "page" : undefined}
                    >
                      {activeBg}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA (desktop) */}
          <Link
            href="/contact"
            className="group relative hidden h-[41px] items-center overflow-hidden rounded-full px-6 text-sm font-medium lg:inline-flex"
          >
            <span className="bg-brand-gradient absolute inset-0 transition-transform duration-500 ease-cinematic group-hover:scale-110" />
            <span className="absolute inset-0 rounded-full opacity-0 shadow-[0_0_30px_rgba(183,43,202,0.7)] transition-opacity duration-500 group-hover:opacity-100" />
            <span className="relative">Start The Project</span>
          </Link>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="relative z-10 grid size-11 place-items-center rounded-full border border-white/10 bg-surface/80 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* Services mega menu (desktop) */}
        <AnimatePresence>
          {servicesOpen && (
            <MegaMenu
              onMouseEnter={openServices}
              onMouseLeave={closeServicesSoon}
              onNavigate={() => setServicesOpen(false)}
            />
          )}
        </AnimatePresence>
      </motion.header>

      {/* Dim the page behind the mega menu */}
      <AnimatePresence>
        {servicesOpen && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setServicesOpen(false)}
            className="fixed inset-0 z-40 hidden bg-background/60 backdrop-blur-sm lg:block"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} isActive={isActive} />}
      </AnimatePresence>
    </>
  );
}
