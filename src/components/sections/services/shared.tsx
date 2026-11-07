"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  motion,
  motionValue,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { isLite } from "@/lib/perf";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll progress of the whole services section (0 = entering from bottom, 1 = leaving at top) */
export const SectionScroll = createContext<MotionValue<number>>(
  motionValue(0.5),
);

/** Parallax helper: moves children with section scroll by ±amount px */
export function useParallax(amount: number) {
  const progress = useContext(SectionScroll);
  const reduce = useReducedMotion();
  return useTransform(progress, [0, 1], reduce ? [0, 0] : [amount, -amount]);
}

/** Wrapper that drifts with section scroll (inner-card depth layers) */
export function ParallaxLayer({
  amount,
  children,
  className,
  style,
}: {
  amount: number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const y = useParallax(amount);
  return (
    <motion.div className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}

/* Card entrance used by the grid (parent controls the stagger) */
export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 70, scale: 0.96, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: EASE },
  },
};

/**
 * Bento card shell: dark glass, spotlight, 3D tilt and scroll parallax.
 *  – Mouse over the card → spotlight + tilt follow the cursor
 *  – No mouse (touch, or cursor elsewhere) → spotlight roams by itself with a gentle tilt
 *  – Scroll → card drifts at its own `depth` and tilts back while entering the screen
 */
export function BentoCard({
  children,
  className,
  tilt = 4,
  depth = 40,
  phase = 0,
  as = "article",
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
  /** Scroll parallax distance in px */
  depth?: number;
  /** Offsets the idle spotlight path so cards don't move in sync */
  phase?: number;
  as?: "article" | "div";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const inView = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const progress = useContext(SectionScroll);

  // Pointer position on the card (0–1), driven by the mouse or the idle path
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), {
    stiffness: 150,
    damping: 18,
  });
  const tiltY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), {
    stiffness: 150,
    damping: 18,
  });

  // Scroll: parallax + "rising panel" tilt
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [depth, -depth]);
  const scrollTilt = useTransform(
    progress,
    [0, 0.35, 0.7, 1],
    reduce ? [0, 0, 0, 0] : [16, 0, 0, -6],
  );
  const rotateX = useTransform(() => tiltX.get() + scrollTilt.get());

  const setSpot = (x: number, yv: number) => {
    ref.current?.style.setProperty("--mx", `${x * 100}%`);
    ref.current?.style.setProperty("--my", `${yv * 100}%`);
  };

  // Idle roaming light (runs only while visible and not hovered; skipped on phones)
  const lite = useRef(false);
  useEffect(() => {
    lite.current = isLite();
  }, []);
  useAnimationFrame((t) => {
    if (reduce || lite.current || hovering.current || !inView) return;
    const s = (t / 1000) * 0.35 + phase;
    const x = 0.5 + 0.38 * Math.sin(s);
    const yv = 0.5 + 0.32 * Math.sin(s * 1.3 + 1);
    setSpot(x, yv);
    // softer tilt while idle (keeps text crisp)
    px.set(0.5 + (x - 0.5) * 0.35);
    py.set(0.5 + (yv - 0.5) * 0.35);
  });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    hovering.current = true;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const yv = (e.clientY - r.top) / r.height;
    px.set(x);
    py.set(yv);
    setSpot(x, yv);
  };
  const onLeave = () => {
    hovering.current = false;
  };

  const MotionTag = as === "article" ? motion.article : motion.div;

  return (
    <motion.div style={{ y }} className={cn("[perspective:1200px]", className)}>
      <MotionTag variants={cardVariant} className="size-full">
        <motion.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX, rotateY: tiltY }}
          className="group/card relative isolate size-full overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0b0810] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] transition-[border-color] duration-500 hover:border-white/[0.14] motion-reduce:!transform-none"
        >
          {children}
          {/* Spotlight — roams when idle, follows the mouse on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 opacity-60 transition-opacity duration-500 group-hover/card:opacity-100 motion-reduce:hidden"
            style={{
              background:
                "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(183,43,202,0.14), transparent 60%)",
            }}
          />
        </motion.div>
      </MotionTag>
    </motion.div>
  );
}

/* Small rounded tag used across the cards */
export function Chip({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-[10px] border border-white/10 bg-[#170f22]/90 px-3.5 py-1.5 text-sm text-text-primary/90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Gentle endless float for chips & small elements */
export function Floaty({
  children,
  className,
  style,
  delay = 0,
  distance = 8,
  duration = 5,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-display text-base font-bold uppercase tracking-wide text-primary lg:text-lg",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm tracking-[0.18em] text-text-primary/85 lg:text-base",
        className,
      )}
    >
      {children}
    </p>
  );
}

export const titleClass =
  "font-display font-bold leading-[1.12] text-text-primary";
