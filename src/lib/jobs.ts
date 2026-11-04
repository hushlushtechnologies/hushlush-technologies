// Open positions — edit this list to add, remove or update roles.
export type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

// TODO: replace with real openings (design shows placeholder UI/UX Designer x5)
export const JOBS: Job[] = [
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    team: "Creative / Design",
    location: "Dubai, UAE",
    type: "Full Time",
    summary: "Design intuitive, beautiful digital experiences across websites, apps and SaaS products.",
    responsibilities: ["Own UX flows, wireframes and high-fidelity UI in Figma", "Build and maintain design systems", "Work closely with developers through launch"],
    requirements: ["3+ years in product or web design", "Strong portfolio of shipped work", "Comfortable with motion and prototyping"],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    team: "Technology",
    location: "Dubai, UAE",
    type: "Full Time",
    summary: "Turn bold designs into fast, animated, accessible web experiences.",
    responsibilities: ["Build sites and apps with Next.js, TypeScript and Tailwind", "Craft scroll and motion experiences", "Keep performance and SEO scores high"],
    requirements: ["3+ years with React", "Experience with Framer Motion / GSAP", "Eye for design detail"],
  },
  {
    id: "motion-designer",
    title: "2D / 3D Motion Designer",
    team: "Production / VFX",
    location: "Dubai, UAE",
    type: "Full Time",
    summary: "Create motion graphics, 3D visuals and CGI for campaigns and brands.",
    responsibilities: ["Animate brand, social and campaign content", "Produce 3D renders and CGI shots", "Collaborate with creative and production teams"],
    requirements: ["Strong After Effects and Blender / C4D skills", "A reel that shows range", "Understanding of storytelling and timing"],
  },
  {
    id: "performance-marketer",
    title: "Performance Marketing Specialist",
    team: "Digital Marketing",
    location: "Dubai, UAE",
    type: "Full Time",
    summary: "Plan, run and optimise paid campaigns that turn attention into growth.",
    responsibilities: ["Manage Meta, Google and TikTok campaigns", "Report on performance and insights", "Test creatives, audiences and funnels"],
    requirements: ["2+ years managing paid media budgets", "Data-driven mindset", "Experience with GA4 and ad platforms"],
  },
  {
    id: "content-creator",
    title: "Content Creator / Videographer",
    team: "Production",
    location: "Dubai, UAE",
    type: "Full Time",
    summary: "Shoot and edit content that makes brands look twice as good.",
    responsibilities: ["Plan and shoot photo and video", "Edit short-form social content", "Support studio and on-location productions"],
    requirements: ["Portfolio of photo / video work", "Premiere Pro or DaVinci Resolve", "Creative eye and energy on set"],
  },
];
