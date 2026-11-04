"use client";

import WhyUs, { type StageConfig } from "@/components/sections/WhyUs";

/*
 * "Creativity Without Limits" values — same 3D-model + flying-cards stage as
 * the home page "Why Hush Lush ?" section, with the robotic hand.
 * Coordinates are from the 1920px Figma frame (cropped to start just above the title).
 */
const VALUES: StageConfig = {
  id: "values",
  title: ["Creativity", "Without Limits"],
  fh: 1180,
  titleTop: 30,
  modelBox: [622, 280, 700],
  glowBox: [580, 300, 800, 760],
  origin: [980, 650],
  connectors: false,
  model: {
    src: "/images/about/hand.webp",
    depthSrc: "/images/about/hand-depth.png",
    alt: "Glossy robotic hand reaching up toward a swirl of purple cosmic energy",
    aspect: 1313 / 736,
    depthSize: [300, 535],
    strength: 0.22, // lighter relief = less smearing
    ambient: 0.95,
    diffuse: 0.4,
    rotY: [-0.35, 0.35],
    rotX: [0.1, -0.05],
    scale: [0.92, 0.98],
    bottomFade: 0.3,
    topFade: 0.08,
    widen: 1.6,
    sizes: "(min-width: 1024px) 700px, 80vw",
  },
  reasons: [
    {
      no: "01",
      title: "Think Bold",
      kicker: "Think Beyond The Obvious.",
      body: "The Best Ideas Rarely Come From Following The Expected Path. We Challenge Assumptions, Explore Possibilities And Look For A Better Way Forward.",
      box: [320, 290, 589, 190],
    },
    {
      no: "02",
      title: "Create With Purpose",
      kicker: "Make Beautiful Things That Matter.",
      body: "Creativity Isn't Decoration. Every Idea Should Have A Reason To Exist, A Story To Tell And A Purpose To Serve.",
      box: [1010, 290, 589, 173],
    },
    {
      no: "03",
      title: "Build Without Limits",
      kicker: "If It Can Be Imagined, It Can Be Built.",
      body: "We Combine Design, Technology And Experimentation To Turn Ambitious Concepts Into Real Experiences.",
      box: [320, 535, 334, 207],
    },
    {
      no: "04",
      title: "Collaborate Differently",
      kicker: "Better Ideas Come From Different Minds.",
      body: "Strategy, Design, Technology And Production Become Stronger When Different Perspectives Work Together.",
      box: [1271, 520, 334, 207],
    },
    {
      no: "05",
      title: "Keep Evolving",
      kicker: "What Works Today Can Be Better Tomorrow.",
      body: "We Stay Curious, Experiment With New Technologies And Constantly Challenge Our Own Way Of Working.",
      box: [320, 795, 415, 190],
    },
  ],
};

export default function AboutValues() {
  return <WhyUs config={VALUES} />;
}
