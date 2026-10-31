"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Real-time rotating globe drawn on the GPU (WebGL).
 * – One 100 KB land-mask texture, no video, sharp at any resolution
 * – Same geometry as the Figma earth (1920×669 frame, ellipse at 960/610, rx 1274, ry 460)
 * – Pauses when off-screen or tab hidden, single still frame for reduced-motion users
 * – Falls back to the static SVG if WebGL isn't available
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uLand;
uniform float uSpin;   // longitude offset (radians)
uniform float uTilt;   // view tilt (radians)
uniform float uAA;     // edge softness in ellipse units

const float PI = 3.14159265;

void main() {
  // Pixel position in the 1920×669 design frame
  vec2 f = vec2(vUv.x * 1920.0, (1.0 - vUv.y) * 669.0);
  float u = (f.x - 960.0) / 1274.0;
  float v = (f.y - 610.5) / 460.5;
  float r = sqrt(u * u + v * v);

  // ── Atmosphere outside the globe ──
  float d = max(r - 1.0, 0.0);
  float glow = exp(-d * 10.0) * 0.55 + exp(-d * 40.0) * 0.35;
  vec3 atmo = vec3(0.45, 0.14, 0.72);

  // ── Surface ──
  float z = sqrt(max(1.0 - r * r, 0.0));
  vec3 n = vec3(u, -v, z);
  float ct = cos(uTilt), st = sin(uTilt);
  vec3 p = vec3(n.x, n.y * ct - n.z * st, n.y * st + n.z * ct);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float lon = atan(p.x, p.z) - uSpin;
  vec2 tex = vec2(fract(lon / (2.0 * PI) + 0.5), 0.5 - lat / PI);
  float land = texture2D(uLand, tex).r;

  float rim = 1.0 - z;                       // 0 at centre → 1 at the horizon
  vec3 landCol = mix(vec3(0.55, 0.52, 0.58), vec3(0.82, 0.55, 0.97), smoothstep(0.5, 0.97, rim));
  vec3 oceanCol = mix(vec3(0.020, 0.012, 0.030), vec3(0.36, 0.10, 0.58), pow(rim, 5.0) * 0.9);
  vec3 surf = mix(oceanCol, landCol, land);
  surf += vec3(0.55, 0.22, 0.85) * smoothstep(0.975, 1.0, r) * 0.5; // bright limb

  float inside = 1.0 - smoothstep(1.0 - uAA, 1.0, r);
  vec3 col = mix(atmo * glow, surf, inside);
  float alpha = mix(glow, 1.0, inside);
  // Straight (non-premultiplied) alpha — the canvas is created with premultipliedAlpha: false
  gl_FragColor = vec4(inside > 0.0 ? col : atmo, alpha);
}`;

const SECONDS_PER_TURN = 150;
const START_LON = -0.35; // Africa/Europe facing the viewer, like the design
const TILT = 0.5; // ~60°N on the horizon, Africa mid-frame (matches the design)

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

export default function RotatingEarth({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) return; // keep SVG fallback

    let raf = 0;
    let visible = true;
    let disposed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Program
    const prog = gl.createProgram()!;
    try {
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
    } catch {
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uSpin = gl.getUniformLocation(prog, "uSpin");
    const uTilt = gl.getUniformLocation(prog, "uTilt");
    const uAA = gl.getUniformLocation(prog, "uAA");
    gl.uniform1f(uTilt, TILT);

    // Size the canvas to its box (capped pixel ratio keeps it cheap on phones)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, wrap.clientWidth < 768 ? 1 : 1.5);
      canvas.width = Math.round(wrap.clientWidth * dpr);
      canvas.height = Math.round(wrap.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uAA, 2.5 / Math.max(canvas.height, 1)); // ~2px soft edge
      if (reduce) draw(0);
    };

    const start = performance.now();
    const draw = (now: number) => {
      const t = reduce ? 0 : (now - start) / 1000;
      gl.uniform1f(uSpin, START_LON + (t / SECONDS_PER_TURN) * Math.PI * 2);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      if (disposed) return;
      draw(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    // Land texture
    const img = new window.Image();
    img.decoding = "async";
    img.src = "/images/hero/earth-land.webp";
    img.onload = () => {
      if (disposed) return;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resize();
      draw(performance.now());
      setReady(true);
      play();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      play();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", play);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative aspect-[1920/669]", className)}>
      {/* Static fallback (no JS / no WebGL) — fades out once the live globe is ready */}
      <Image
        src="/images/hero/earth.svg"
        alt=""
        fill
        priority
        unoptimized
        className={cn("transition-opacity duration-1000", ready ? "opacity-0" : "opacity-100")}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn("absolute inset-0 size-full transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
