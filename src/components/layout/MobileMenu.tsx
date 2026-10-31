"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { mainNav, serviceCategories, serviceHref } from "@/lib/navigation";
import { ChevronDown, Close } from "@/components/ui/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const overlay: Variants = {
  hidden: { clipPath: "circle(0% at calc(100% - 42px) 42px)" },
  show: {
    clipPath: "circle(150% at calc(100% - 42px) 42px)",
    transition: { duration: 0.7, ease: EASE, staggerChildren: 0.06, delayChildren: 0.2 },
  },
  exit: {
    clipPath: "circle(0% at calc(100% - 42px) 42px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type Props = { onClose: () => void; isActive: (href: string) => boolean };

export default function MobileMenu({ onClose, isActive }: Props) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);

  // Lock page scroll while menu is open
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      variants={overlay}
      initial="hidden"
      animate="show"
      exit="exit"
      data-lenis-prevent
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background lg:hidden"
      style={{
        backgroundImage:
          "radial-gradient(80% 50% at 50% 110%, rgba(102,34,159,0.55) 0%, rgba(6,5,8,0) 70%)",
      }}
    >
      <div className="container-site flex h-[84px] shrink-0 items-center justify-between">
        <Link href="/" onClick={onClose} aria-label="Home">
          <Image src="/images/logo.svg" alt="Hushlush Technologies" width={128} height={45} className="h-9 w-auto" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-11 place-items-center rounded-full border border-white/10 bg-surface"
        >
          <Close className="size-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="container-site flex-1 pb-10 pt-6">
        <ul className="space-y-1">
          {mainNav.map((link) =>
            link.label === "Services" ? (
              <motion.li key={link.label} variants={item}>
                <button
                  type="button"
                  onClick={() => setServicesOpen((o) => !o)}
                  aria-expanded={servicesOpen}
                  className="flex w-full items-center justify-between py-3 font-display text-4xl font-bold uppercase"
                >
                  {link.label}
                  <ChevronDown className={cn("size-7 transition-transform duration-300", servicesOpen && "rotate-180")} />
                </button>

                <AnimatePresence initial={false}>
                  {servicesOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden border-l border-white/10 pl-4"
                    >
                      {serviceCategories.map((cat, i) => (
                        <li key={cat.title} className="border-b border-white/5 last:border-0">
                          <button
                            type="button"
                            onClick={() => setOpenCat(openCat === i ? null : i)}
                            aria-expanded={openCat === i}
                            className="flex w-full items-center justify-between py-3 text-left font-display text-sm uppercase tracking-wide text-text-primary/60"
                          >
                            {cat.title}
                            <ChevronDown className={cn("size-4 transition-transform", openCat === i && "rotate-180")} />
                          </button>
                          <AnimatePresence initial={false}>
                            {openCat === i && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="space-y-3 overflow-hidden pb-4"
                              >
                                {cat.items.map((s) => (
                                  <li key={s}>
                                    <Link href={serviceHref(cat.title, s)} onClick={onClose} className="text-sm text-text-primary/90">
                                      {s}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.li>
            ) : (
              <motion.li key={link.label} variants={item}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block py-3 font-display text-4xl font-bold uppercase",
                    isActive(link.href) ? "text-primary" : "text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </motion.li>
            )
          )}
        </ul>

        <motion.div variants={item} className="mt-10">
          <Link
            href="/contact"
            onClick={onClose}
            className="bg-brand-gradient inline-flex h-12 items-center rounded-full px-8 text-sm font-medium"
          >
            Start The Project
          </Link>
        </motion.div>
      </nav>
    </motion.div>
  );
}
