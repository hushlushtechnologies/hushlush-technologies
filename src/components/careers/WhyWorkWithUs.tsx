"use client";

import Capabilities, { type CapConfig } from "@/components/about/Capabilities";

/** Same pinned "image + stepping cards" stage as the About capabilities, with the glass staircase. */
const WHY_WORK: CapConfig = {
  id: "why-work",
  title: "Why Work With Us?",
  sweep: "y", // light climbs the stairs as you scroll
  icon: false,
  image: {
    src: "/images/careers/stairs.webp",
    alt: "Glowing glass staircase rising into purple light — growing your career step by step",
    aspect: "736 / 900",
    objectPosition: "62% 60%",
    maxWidth: "min(600px, 72vh)",
    feather: true,
  },
  items: [
    { no: "01", title: "Work That Matters", line: "Work On Brands, Campaigns, Digital Products And Experiences That Reach Real Audiences.", href: "#openings" },
    { no: "02", title: "Work Across Disciplines", line: "Work Alongside Strategists, Designers, Developers, Marketers And Production Teams.", href: "#openings" },
    { no: "03", title: "Room To Experiment", line: "We Encourage Experimentation — Whether That's A New Design Approach, Creative Technology, AI Workflow Or Production Technique.", href: "#openings" },
    { no: "04", title: "Keep Learning", line: "Technology Changes Quickly. So Do We. You'll Constantly Encounter New Tools, Ideas And Challenges.", href: "#openings" },
    { no: "05", title: "Grow With The Team", line: "Take Ownership, Build New Skills And Grow Alongside People Who Want To See You Succeed.", href: "#openings" },
  ],
};

export default function WhyWorkWithUs() {
  return <Capabilities config={WHY_WORK} />;
}
