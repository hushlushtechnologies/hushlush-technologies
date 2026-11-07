"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { DepthModel, type DepthModelConfig } from "@/components/three/DepthModel";
import { isLite } from "@/lib/perf";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Floating code panels ───────────────────────── */

const SNIPPETS = [
  ["const app = createApp({", "  routes, auth, cache,", "  scale: 'auto',", "});", "await app.deploy();"],
  ["GET /api/v2/orders", "200 OK · 38ms", "{ id: 9182,", "  status: 'paid' }"],
  ["▲ build passed", "✓ 412 tests", "✓ lint · types", "→ shipping v3.4.1"],
];

function Typing({ lines, start, reduce }: { lines: string[]; start: boolean; reduce: boolean }) {
  const full = lines.join("\n");
  const [n, setN] = useState(reduce ? full.length : 0);
  useEffect(() => {
    if (!start || reduce) return;
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i = i >= full.length + 40 ? 0 : i + 1; // type, pause, restart
      setN(Math.min(i, full.length));
      t = setTimeout(tick, i > full.length ? 60 : 28 + Math.random() * 40);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [start, reduce, full]);
  return (
    <pre className="whitespace-pre font-mono text-[clamp(7px,0.62cqw,11px)] leading-[1.55] text-[#d9c6ff]">
      {full.slice(0, n)}
      <span className="ml-px inline-block h-[1.1em] w-[0.5em] translate-y-[0.15em] bg-grad-start/90 motion-safe:animate-[pulse_1s_steps(2)_infinite]" />
    </pre>
  );
}

const PANELS = [
  { left: "2%", top: "74%", depth: -26, delay: 1.6, w: "32%" },
  { left: "70%", top: "8%", depth: 34, delay: 1.9, w: "30%" },
  { left: "62%", top: "66%", depth: 20, delay: 2.2, w: "30%" },
];

/* ───────────────────────── Rising glyph particles ───────────────────────── */

function Glyphs({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const c = ref.current;
    if (!c || !active || reduce || isLite()) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const chars = "01{}<>/=;()[]#$&*+".split("");
    type P = { x: number; y: number; v: number; ch: string; a: number; s: number };
    const ps: P[] = [];
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(c);
    const loop = () => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (ps.length < 70 && Math.random() < 0.5)
        ps.push({ x: Math.random() * w, y: h + 10, v: 0.3 + Math.random() * 0.8, ch: chars[(Math.random() * chars.length) | 0], a: 0, s: 9 + Math.random() * 7 });
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.y -= p.v;
        p.a = Math.min(1, p.a + 0.02);
        const life = p.y / h;
        if (p.y < -10) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.a * Math.min(1, life * 1.6) * 0.55;
        ctx.fillStyle = Math.random() < 0.02 ? "#ffffff" : "#b98cff";
        ctx.font = `${p.s}px ui-monospace, monospace`;
        ctx.fillText(p.ch, p.x, p.y);
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [active, reduce]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/* ───────────────────────── Stage ───────────────────────── */

export default function SoftwareStage({
  play,
  progress,
  model,
  mx,
  my,
}: {
  play: boolean;
  progress: MotionValue<number>;
  model: DepthModelConfig;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const reduce = !!useReducedMotion();
  const px = [useTransform(mx, (v) => v * PANELS[0].depth), useTransform(mx, (v) => v * PANELS[1].depth), useTransform(mx, (v) => v * PANELS[2].depth)];
  const py = [useTransform(my, (v) => v * PANELS[0].depth * 0.6), useTransform(my, (v) => v * PANELS[1].depth * 0.6), useTransform(my, (v) => v * PANELS[2].depth * 0.6)];

  return (
    <div className="relative aspect-square w-full [container-type:inline-size]">
      {/* perspective grid floor */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scaleX: 0.3 }}
        animate={play ? { opacity: 1, scaleX: 1 } : undefined}
        transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
        className="absolute inset-x-[-20%] bottom-[2%] h-[38%] [perspective:500px]"
      >
        <div className="absolute inset-0 origin-bottom [transform:rotateX(68deg)] [background-image:linear-gradient(rgba(183,43,202,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(183,43,202,0.35)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_50%_100%,black_20%,transparent_70%)] motion-safe:animate-[gridflow_6s_linear_infinite]" />
      </motion.div>

      {/* aura */}
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[10%] top-[18%] h-[65%] w-[75%] rounded-full bg-[radial-gradient(closest-side,rgba(130,50,230,0.45),rgba(90,20,160,0.18)_60%,transparent)] blur-2xl"
      />

      <Glyphs active={play} />

      {/* the 3D relief model — boots in with a scan */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(24px) brightness(2.4)", scale: 1.06 }}
        animate={play ? { opacity: 1, filter: "blur(0px) brightness(1)", scale: 1 } : undefined}
        transition={{ duration: 1.8, ease: EASE, delay: 0.3 }}
        className="absolute inset-0"
      >
        <DepthModel progress={progress} config={model} className="w-full" />
        {/* boot scan line */}
        {!reduce && (
          <motion.div
            aria-hidden
            initial={{ top: "0%", opacity: 0 }}
            animate={play ? { top: ["0%", "100%"], opacity: [0, 1, 1, 0] } : undefined}
            transition={{ duration: 1.8, delay: 0.5, ease: "easeInOut", times: [0, 0.1, 0.85, 1] }}
            className="pointer-events-none absolute inset-x-[8%] h-[3px] bg-[linear-gradient(90deg,transparent,#e96ed8,#fff,#e96ed8,transparent)] shadow-[0_0_30px_8px_rgba(233,110,216,0.55)]"
          />
        )}
        {/* recurring screen flicker / light sweep over the monitors */}
        <div aria-hidden className="pointer-events-none absolute left-[8%] top-[10%] h-[62%] w-[46%] overflow-hidden mix-blend-screen [mask-image:radial-gradient(closest-side,black,transparent)]">
          <span className="absolute inset-x-0 -top-1/3 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(200,160,255,0.25),transparent)] motion-safe:animate-[screenscan_4.5s_linear_infinite]" />
        </div>
      </motion.div>

      {/* floating glass code panels */}
      {PANELS.map((pn, i) => (
        <motion.div key={i} aria-hidden style={{ left: pn.left, top: pn.top, width: pn.w, x: px[i], y: py[i] }} className="absolute">
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -30, scale: 0.85 }}
            animate={play ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: pn.delay }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, i % 2 ? 8 : -8, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-xl border border-white/10 bg-[#12091f]/70 p-[0.9cqw] shadow-[0_20px_50px_-20px_rgba(120,40,220,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
            >
              <div className="mb-[0.6cqw] flex gap-1">
                <span className="size-[0.55cqw] min-h-1.5 min-w-1.5 rounded-full bg-[#ff5f57]" />
                <span className="size-[0.55cqw] min-h-1.5 min-w-1.5 rounded-full bg-[#febc2e]" />
                <span className="size-[0.55cqw] min-h-1.5 min-w-1.5 rounded-full bg-[#28c840]" />
              </div>
              <Typing lines={SNIPPETS[i]} start={play} reduce={reduce} />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
