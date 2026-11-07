"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Pauses the looping CSS animations (marquees, sweeps, pulses, floats…) of every
 * section that is off-screen, so the browser only animates what you can see.
 * Big win for scrolling smoothness on phones; invisible to the visitor.
 */
export default function OffscreenPause() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-offscreen", !e.isIntersecting)),
      { rootMargin: "200px 0px" },
    );
    const watch = () => document.querySelectorAll("main section, footer").forEach((el) => io.observe(el));
    const raf = requestAnimationFrame(watch);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
