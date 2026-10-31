"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * 3D cinema camera (WebGL / three.js).
 * The flat render is turned into a relief mesh using an AI depth map (Depth Anything V2),
 * so it physically rotates with perspective and catches a moving light as you scroll.
 *
 * Assets: /images/frame/camera.webp (colour, transparent) + /images/frame/camera-depth.png (depth)
 */

export type DepthModelConfig = {
  src: string;
  depthSrc: string;
  alt: string;
  /** height / width of the render */
  aspect: number;
  /** depth-map resolution (for normal calculation) */
  depthSize: [number, number];
  /** how far the relief pops out */
  strength?: number;
  /** rotation in radians at progress 0 → 1 */
  rotY: [number, number];
  rotX: [number, number];
  scale?: [number, number];
  /** fade the bottom edge (0–1 of height) */
  bottomFade?: number;
  /** extra canvas width so the model never clips while rotating */
  widen?: number;
  sizes?: string;
};

const VERT = /* glsl */ `
uniform sampler2D uDepth;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vec3 p = position;
  p.z += (d - 0.5) * uStrength;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uTexel;
uniform vec3 uLight;
uniform float uGlow;
uniform float uFade;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uColor, vUv);
  c.a *= smoothstep(0.0, uFade + 0.0001, vUv.y);
  if (c.a < 0.04) discard;
  // surface normal from the depth map → real-looking light as the model turns
  float dx = texture2D(uDepth, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDepth, vUv - vec2(uTexel.x, 0.0)).r;
  float dy = texture2D(uDepth, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDepth, vUv - vec2(0.0, uTexel.y)).r;
  vec3 n = normalize(vec3(-dx * 7.0, -dy * 7.0, 1.0));
  float diff = max(dot(n, normalize(uLight)), 0.0);
  float rim = pow(1.0 - n.z, 2.0);
  vec3 col = c.rgb * (0.72 + 0.48 * diff) + vec3(0.72, 0.30, 0.95) * rim * 0.55 * uGlow;
  gl_FragColor = vec4(col, c.a);
}`;

type Props = {
  /** 0 → 1 scroll progress that drives the turn */
  progress: MotionValue<number>;
  className?: string;
};

export function DepthModel({ progress, className, config }: Props & { config: DepthModelConfig }) {
  const { src, depthSrc, alt, aspect: IMG_ASPECT, depthSize, strength = 0.42, rotY, rotX, scale = [0.86, 1.03], bottomFade = 0, widen: CANVAS_WIDEN = 1.7, sizes } = config;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let raf = 0;
    let visible = true;
    let cleanup = () => {};
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0 };

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL → keep the static image
      }
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setClearColor(0x000000, 0);

      const loader = new THREE.TextureLoader();
      const [colorTex, depthTex] = await Promise.all([
        loader.loadAsync(src),
        loader.loadAsync(depthSrc),
      ]);
      if (disposed) return;
      colorTex.colorSpace = THREE.NoColorSpace;
      colorTex.anisotropy = 4;

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
      const geo = new THREE.PlaneGeometry(1, IMG_ASPECT, 180, 320);
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uColor: { value: colorTex },
          uDepth: { value: depthTex },
          uTexel: { value: new THREE.Vector2(1 / depthSize[0], 1 / depthSize[1]) },
          uStrength: { value: strength },
          uFade: { value: bottomFade },
          uLight: { value: new THREE.Vector3(0, 0.5, 1) },
          uGlow: { value: 1 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const resize = () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, w < 500 ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        // fit the plane's height to the canvas height
        cam.position.z = (IMG_ASPECT / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) * 1.02;
        cam.updateProjectionMatrix();
      };
      resize();

      // smoothed state
      let p = progress.get();
      let mx = 0;
      let my = 0;
      const start = performance.now();

      const frame = (now: number) => {
        const t = (now - start) / 1000;
        p += (progress.get() - p) * 0.08;
        mx += (mouse.x - mx) * 0.05;
        my += (mouse.y - my) * 0.05;

        const idle = reduce ? 0 : 1;
        mesh.rotation.y = THREE.MathUtils.lerp(rotY[0], rotY[1], p) + mx * 0.18 + Math.sin(t * 0.45) * 0.04 * idle;
        mesh.rotation.x = THREE.MathUtils.lerp(rotX[0], rotX[1], p) + my * 0.08 + Math.sin(t * 0.6) * 0.015 * idle;
        mesh.position.y = Math.sin(t * 0.8) * 0.012 * idle;
        const s = THREE.MathUtils.lerp(scale[0], scale[1], p);
        mesh.scale.set(s, s, s);

        const a = THREE.MathUtils.lerp(-1.3, 1.1, p);
        mat.uniforms.uLight.value.set(Math.sin(a), 0.45, Math.cos(a) * 0.9 + 0.2);
        mat.uniforms.uGlow.value = 0.8 + Math.sin(t * 1.6) * 0.2 * idle;

        renderer.render(scene, cam);
      };

      const loop = (now: number) => {
        if (disposed) return;
        frame(now);
        if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
      };
      const play = () => {
        cancelAnimationFrame(raf);
        if (reduce) frame(performance.now());
        else if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      };

      const onMove = (e: PointerEvent) => {
        mouse.x = e.clientX / window.innerWidth - 0.5;
        mouse.y = e.clientY / window.innerHeight - 0.5;
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        play();
      });
      const ro = new ResizeObserver(() => {
        resize();
        if (reduce) frame(performance.now());
      });
      io.observe(wrap);
      ro.observe(wrap);
      window.addEventListener("pointermove", onMove);
      document.addEventListener("visibilitychange", play);

      frame(performance.now());
      setReady(true);
      play();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", play);
        geo.dispose();
        mat.dispose();
        colorTex.dispose();
        depthTex.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // config is static per instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: `1 / ${IMG_ASPECT}` }}>
      {/* Static image: SEO + shown until WebGL is ready (or if it isn't available) */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 600px, 80vw"}
        className={cn("object-contain transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")}
      />
      <div
        ref={wrapRef}
        className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{ width: `${CANVAS_WIDEN * 100}%` }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn("size-full transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        />
      </div>
    </div>
  );
}

const CAMERA: DepthModelConfig = {
  src: "/images/frame/camera.webp",
  depthSrc: "/images/frame/camera-depth.png",
  alt: "Professional cinema camera on a tripod wrapped in purple light trails",
  aspect: 2149 / 1200,
  depthSize: [300, 537],
  rotY: [-0.62, 0.42],
  rotX: [0.14, -0.06],
  sizes: "(min-width: 1024px) 590px, 80vw",
};

export default function CameraModel(props: Props) {
  return <DepthModel {...props} config={CAMERA} />;
}
