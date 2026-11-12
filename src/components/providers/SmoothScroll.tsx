"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLite } from "@/lib/perf";
import OffscreenPause from "@/components/providers/OffscreenPause";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll (desktop only), synced with GSAP ScrollTrigger.
 * Phones/touch devices use native scrolling (already smooth, and cheaper).
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const fromHistory = useRef(false);

  // Back/Forward should keep the browser's remembered position.
  useEffect(() => {
    const onPop = () => (fromHistory.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Always start a new page at the top (unless the link targets a #section).
  // Without this, Lenis / pinned sections can keep the previous page's scroll
  // position, e.g. Home footer -> About opened at the About footer.
  useEffect(() => {
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    const toTop = () => {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    toTop();
    const raf = requestAnimationFrame(() => {
      toTop();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isLite()) return;

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <>
      <OffscreenPause />
      {children}
    </>
  );
}
