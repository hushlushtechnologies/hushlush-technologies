"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  duration?: number;
  className?: string;
  /** set false to hold the count (e.g. until the preloader finishes) */
  start?: boolean;
};

/** Counts from 0 to `to` when scrolled into view. Final value is in the HTML for SEO. */
export default function CountUp({ to, decimals = 0, prefix = "", suffix = "", delay = 0, duration = 2, className, start = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    if (!inView || !start || reduce || !ref.current) return;
    const el = ref.current;
    el.textContent = format(0);
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, start]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
