"use client";

import { useEffect, type ReactNode } from "react";
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
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isLite()) return;

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <OffscreenPause />
      {children}
    </>
  );
}
