// Content for each service category page (/services/<slug>).
// Add a new entry here when the design for another category arrives.

import { slugify } from "@/lib/navigation";

export type ServicePage = {
  category: string; // must match a title in serviceCategories
  slug: string;
  metaDescription: string;
  /** services shown in the branching tree (defaults to the menu list) */
  treeItems?: string[];
  hero: {
    tag: string;
    title: string[]; // one entry per line
    intro: string;
    cta: { label: string; href: string };
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
      frame?: boolean;
      /** position on the 1920 frame in cqw (1280 column) */
      box?: { left: number; top: number; w: number };
      motion?: "spin" | "unspool" | "hologram" | "orbit" | "billboard" | "depth";
      /** depth map for a real-time 3D relief (motion: "depth") */
      depth?: { src: string; size: [number, number] };
    };
    ghost: [string, string];
    /** left position of the second ghost word in cqw (default 46.4) */
    ghostX?: number; // big outlined words drifting behind the image
  };
  statement: {
    title: string[];
    /** Wrap highlighted phrases in [[double brackets]] */
    paragraph: string;
    /** box = position on the 1920 frame in cqw (1280 column); front = image above the text */
    image: { src: string; width: number; height: number; box?: { left: number; top: number; w: number }; motion?: "flow" | "rise"; tint?: boolean };
  };
  offerings?: {
    title: string;
    items: {
      /** the service name exactly as in the menu (used for the #anchor) */
      key: string;
      title: string;
      text: string;
      image: string;
    }[];
  };
  process?: {
    title: string;
    /** glow = CSS colour of the aura behind the visual */
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
      glow?: string;
      /** colour wash applied to the visual (e.g. brand purple) */
      tint?: string;
      /** set false to keep a tinted visual bright (no dark vignette) */
      dim?: boolean;
      /** position on the 1280 stage in cqw */
      box?: { left: number; top: number; w: number };
    };
    steps: { title: string; tagline: string; text: string }[];
  };
  faq?: { q: string; a: string }[];
  /** image + card + checklist rows (Production page) */
  listings?: {
    title: string;
    items: { key: string; title: string; text: string; image: string; list: string[]; /** other menu items that should land on this block */ alias?: string[] }[];
    /** optional wide photo closing the section */
    banner?: { src: string; alt: string };
  };
  /** data/curve storytelling section (Digital Marketing page) */
  insights?: {
    eyebrow: string;
    title: string;
    /** exactly 4 points along the curve */
    stats: { value: number; decimals?: number; prefix?: string; suffix?: string; label: string }[];
  };
  /** alternating full-width service showcases (Branding page) */
  details?: {
    cta: { label: string; href: string };
    items: {
      key: string; // service name as in the tree (used for the #anchor)
      title: string;
      text: string;
      example: string;
      image: string;
      /** wide = title row + centred image; left = text left / image right; right = image left / text right */
      layout: "wide" | "left" | "right";
      /** wide only: put the button on the left and the title on the right */
      reverse?: boolean;
      /** wide only: indent the intro text */
      indent?: boolean;
      /** which side the example text sits on (the gradient line takes the other side) */
      exampleSide?: "left" | "right";
    }[];
  };
};

const pages: Omit<ServicePage, "slug">[] = [
  {
    category: "Creative Solution",
    metaDescription:
      "Graphic, promotion, print, corporate and social media design that makes brands clearer, sharper and impossible to overlook — by Hush Lush Technologies, Dubai.",
    hero: {
      tag: "Creative Solution",
      title: ["Ideas Designed", "To Be Seen."],
      intro:
        "We Turn Ideas Into Visual Experiences That Make Brands Clearer, Sharper And Impossible To Overlook — Across Digital, Print And Every Touchpoint In Between.",
      cta: { label: "Start A Creative Project", href: "/contact#enquiry" },
      image: { src: "/images/services/creative-solution/blob.webp", width: 605, height: 543, alt: "Iridescent liquid-glass sculpture" },
      ghost: ["Creative", "Solution"],
    },
    statement: {
      title: ["Good Design Gets", "Attention. Great Design", "Gives It A Reason."],
      paragraph:
        "Every Visual Has A Job. We Combine [[Creative Thinking, Visual Hierarchy And Strategic]] Intent To Create Communication That Doesn't Simply Look Good — It Makes People Notice, Understand And Act.",
      image: { src: "/images/services/creative-solution/ribbon.webp", width: 1128, height: 1758 },
    },
    offerings: {
      title: "Creative Service We Offer",
      items: [
        {
          key: "Graphic Design",
          title: "Graphic Design",
          text: "We Create Purposeful Visual Communication For Brands, Campaigns And Everyday Business Needs From Digital Graphics To Complete Visual Compositions.",
          image: "/images/services/creative-solution/graphic-design.webp",
        },
        {
          key: "Promotion Design",
          title: "Promotion Design",
          text: "We Create Promotional Visuals That Communicate Offers, Launches, Events And Campaigns With Immediate Visual Impact.",
          image: "/images/services/creative-solution/promotion-design.webp",
        },
        {
          key: "Printable Design",
          title: "Printable Design",
          text: "From Flyers And Brochures To Posters And Promotional Materials, We Create Print-Ready Designs That Translate Beautifully From Screen To Physical Media.",
          image: "/images/services/creative-solution/printable-design.webp",
        },
        {
          key: "Corporate Design",
          title: "Corporate Design",
          text: "We Design Professional Corporate Communication That Turns Business Information Into A Clear, Credible And Polished Visual Experience.",
          image: "/images/services/creative-solution/corporate-design.webp",
        },
        {
          key: "Business Design",
          title: "Business Design",
          text: "We Create Visual Systems For Business Communication — Presentations, Proposals, Reports, Documents And Customer-Facing Materials That Make Information Easier To Understand And Act On.",
          image: "/images/services/creative-solution/business-design.webp",
        },
        {
          key: "Stationery Design",
          title: "Stationery Design",
          text: "We Design Cohesive Stationery Systems That Bring Your Visual Identity Into Everyday Business Interactions.",
          image: "/images/services/creative-solution/stationery-design.webp",
        },
        {
          key: "Social Media Creative Design",
          title: "Social Media Creatives",
          text: "We Create Social-First Visual Content Designed To Capture Attention Quickly While Maintaining A Consistent Brand Identity Across Platforms.",
          image: "/images/services/creative-solution/social-media-creative-design.webp",
        },
      ],
    },
    process: {
      title: "Process",
      image: { src: "/images/services/creative-solution/process-head.webp", width: 860, height: 1259, alt: "Glass head reflecting a glowing mountain landscape" },
      steps: [
        { title: "Discover", tagline: "Understand The Message.", text: "We Learn About The Brand, Audience, Objective And Context." },
        { title: "Concept", tagline: "Find The Visual Idea.", text: "We Explore Creative Directions, References And Visual Possibilities." },
        { title: "Design", tagline: "Build The Experience.", text: "We Transform The Chosen Direction Into Polished Creative Assets." },
        { title: "Refine", tagline: "Make Every Detail Count.", text: "We Review Hierarchy, Consistency, Usability And Visual Impact." },
        { title: "Deliver", tagline: "Ready For Every Channel.", text: "We Prepare Final Assets For Digital, Print, Social And Physical Applications." },
      ],
    },
    faq: [
      {
        q: "What types of creative design do you provide?",
        a: "We provide graphic, promotional, printable, corporate, business, stationery and social media creative design.",
      },
      {
        q: "Can you design for both digital and print?",
        a: "Yes. We design creative assets specifically for digital platforms, social media, presentations, websites, advertising and professional print production.",
      },
      {
        q: "Can you work with our existing brand identity?",
        a: "Absolutely. We can work within your existing guidelines or help evolve the visual direction when required.",
      },
      {
        q: "Do you create social media designs regularly?",
        a: "Yes. We can develop individual campaign creatives or create a complete ongoing visual system for your social media channels.",
      },
      {
        q: "Can you handle large corporate design projects?",
        a: "Yes. Corporate profiles, presentations, proposals, reports, stationery and business communication systems can all be handled as part of the service.",
      },
      {
        q: "Do you provide print-ready files?",
        a: "Yes. We prepare final artwork according to the required print specifications and production requirements.",
      },
    ],
  },
];

pages.push({
  category: "Branding & Identity",
  treeItems: [
    "Brand Strategy",
    "Brand Identity",
    "Corporate Identity",
    "Brand Application",
    "Brand Guidelines",
    "Brand Book",
    "Asset Library",
    "Event Branding",
  ],
  metaDescription:
    "Brand strategy, brand identity, corporate identity and brand application — Hush Lush Technologies builds distinctive brands people remember, in Dubai and beyond.",
  hero: {
    tag: "Branding & Identity",
    title: ["Build A Brand", "People Remember."],
    intro:
      "We Build Distinctive Brands From The Inside Out — Defining What They Stand For, How They Look, And How They Show Up Everywhere.",
    cta: { label: "Build Your Brand", href: "/contact#enquiry" },
    image: { src: "/images/services/branding-and-identity/logo-gold.webp", width: 692, height: 674, alt: "Gold 3D phoenix brand mark", frame: true },
    ghost: ["Branding", "Identity"],
  },
  statement: {
    title: ["A Logo Is Only The", "Beginning."],
    paragraph:
      "A Powerful Brand Is More Than A Mark. It's A [[Strategy, A Personality, A Visual Language]] And A Consistent Experience Across Every Touchpoint.",
    image: { src: "/images/services/branding-and-identity/hand.webp", width: 766, height: 1066, box: { left: 29, top: 14.1, w: 43 }, motion: "rise" },
  },
  details: {
    cta: { label: "Build Your Brand", href: "/contact#enquiry" },
    items: [
      {
        key: "Brand Strategy",
        title: "Brand Strategy",
        text: "We Define The Strategic Foundation Of Your Brand — Positioning, Purpose, Audience, Personality And Direction.",
        example: "A New UAE Hospitality Brand Is Entering A Competitive Market And Needs A Clear Position That Separates It From Established Luxury Players.",
        image: "/images/services/branding-and-identity/brand-strategy.webp",
        layout: "wide",
        indent: true,
        exampleSide: "left",
      },
      {
        key: "Brand Identity",
        title: "Brand Identity",
        text: "We Translate Your Strategy Into A Distinctive Visual Identity Through Logo, Typography, Colour, Imagery And Graphic Language.",
        example: "A Technology Startup Has A Strong Product But No Recognizable Visual Identity And Needs A System That Works Across Its Website, App, Social Channels And Marketing.",
        image: "/images/services/branding-and-identity/brand-identity.webp",
        layout: "left",
      },
      {
        key: "Corporate Identity",
        title: "Corporate Identity",
        text: "We Create Cohesive Corporate Identities That Bring Professionalism And Consistency To Every Business Interaction.",
        example: "A Growing Investment Group Needs A Unified Corporate Identity Across Its Company Profile, Presentations, Stationery, Offices And Client Communications.",
        image: "/images/services/branding-and-identity/corporate-identity.webp",
        layout: "right",
      },
      {
        key: "Brand Application",
        title: "Brand Application",
        text: "We Extend The Identity Across Physical And Digital Touchpoints So The Brand Feels Consistent Wherever People Encounter It.",
        example: "A New Premium Retail Brand Needs Its Identity Translated Across Packaging, Social Media, Storefronts, Printed Materials And Customer Experiences.",
        image: "/images/services/branding-and-identity/brand-application.webp",
        layout: "wide",
        reverse: true,
        indent: true,
        exampleSide: "right",
      },
      {
        key: "Brand Guidelines",
        title: "Brand Guidelines",
        text: "We Establish Clear Rules For Logo Usage, Typography, Colors, Imagery And Brand Applications So Every Touchpoint Feels Unmistakably Yours.",
        example: "A Growing Company With Multiple Marketing Teams Needs One Clear System So Every Designer, Employee And External Partner Communicates The Same Brand.",
        image: "/images/services/branding-and-identity/brand-guidelines.webp",
        layout: "left",
      },
      {
        key: "Brand Book",
        title: "The Brand Book",
        text: "We Bring Your Strategy, Identity, Personality And Visual World Together Into One Comprehensive Brand Book That Everyone Can Understand And Use.",
        example: "A Newly Launched Company Uses Its Brand Book To Align Internal Teams, Agencies, Partners And Vendors Before Going To Market.",
        image: "/images/services/branding-and-identity/brand-book.webp",
        layout: "right",
      },
      {
        key: "Asset Library",
        title: "Asset Libraries",
        text: "We Organize Your Approved Brand Assets Into Structured, Accessible Libraries That Make Everyday Marketing Faster And More Consistent.",
        example: "A Marketing Team Managing Multiple Campaigns Can Instantly Access Approved Logos, Social Templates, Presentation Assets, Photography And Campaign Files.",
        image: "/images/services/branding-and-identity/asset-library.webp",
        layout: "wide",
        exampleSide: "left",
      },
      {
        key: "Event Branding",
        title: "Event Branding",
        text: "We Create Complete Event Identities Across Stages, Signage, Invitations, Screens, Environments And Guest Touchpoints.",
        example: "A Corporate Conference In Dubai Needs A Unified Visual Identity Across Its Stage, Registration Area, Digital Screens, Badges And Attendee Materials.",
        image: "/images/services/branding-and-identity/event-branding.webp",
        layout: "wide",
        exampleSide: "left",
      },
    ],
  },
  process: {
    title: "Process",
    image: { src: "/images/services/branding-and-identity/process-chess.webp", width: 393, height: 556, alt: "Black and white chess kings colliding in a splash", glow: "rgba(120,60,220,0.3)" },
    steps: [
      { title: "Discover", tagline: "Understand The Business.", text: "We Learn About Your Business, Audience, Market, Competitors And Ambitions." },
      { title: "Define", tagline: "Find Your Position.", text: "We Clarify Your Purpose, Positioning, Personality And Brand Direction." },
      { title: "Design", tagline: "Build The Identity.", text: "We Translate The Strategy Into A Distinctive Visual And Verbal System." },
      { title: "Apply", tagline: "Make It Recognizable.", text: "We Extend The Identity Across Digital, Physical And Customer Touchpoints." },
      { title: "Evolve", tagline: "Keep The Brand Moving.", text: "We Create Systems Designed To Stay Relevant As Your Business Grows." },
    ],
  },
  faq: [
    {
      q: "What does your branding service include?",
      a: "Our branding service covers brand strategy, brand identity, corporate identity and the application of the brand across relevant digital and physical touchpoints.",
    },
    {
      q: "Do you create brands from scratch?",
      a: "Yes. We can take a brand from the initial strategic stage through identity development and real-world application.",
    },
    {
      q: "Can you rebrand an existing company?",
      a: "Yes. We can refresh an existing identity or develop a complete rebrand depending on the business objectives.",
    },
    {
      q: "What is the difference between branding and a logo?",
      a: "A logo is one element of an identity. Branding encompasses the strategy, positioning, personality and complete experience that shapes how people perceive the business.",
    },
    {
      q: "Do you provide brand guidelines?",
      a: "Yes. We can create comprehensive guidelines covering the visual identity, typography, colours, imagery, logo usage and application rules.",
    },
    {
      q: "Can you apply the identity to physical materials?",
      a: "Yes. We can extend the brand into stationery, packaging, corporate materials, retail environments, events and other physical applications.",
    },
  ],
});

pages.push({
  category: "Production Service",
  metaDescription:
    "Photography, videography, studio production, creative direction and post production in Dubai — Hush Lush Technologies produces visuals people see, feel and remember.",
  hero: {
    tag: "Production Service",
    title: ["Ideas Deserve", "To Be Seen."],
    intro:
      "From The First Concept To The Final Cut, We Produce Photography And Film That Gives Brands A Visual Presence People Can See, Feel And Remember.",
    cta: { label: "Start A Production", href: "/contact#enquiry" },
    image: {
      src: "/images/services/production-service/film-reel.webp",
      width: 522,
      height: 1313,
      alt: "Spiralling strip of film",
      box: { left: 45.5, top: -22.3, w: 33.4 },
      motion: "unspool",
    },
    ghost: ["Production", "Experience"],
    ghostX: 37,
  },
  statement: {
    title: ["The Real Work Is Making", "People Feel Something."],
    paragraph:
      "Every Frame Has A Purpose. We Combine Creative Direction, Production Craft And Technology To Create Visuals That Communicate, Connect And Stay Remembered.",
    image: { src: "/images/services/production-service/film-face.webp", width: 544, height: 945, box: { left: 29, top: -0.7, w: 42.1 }, motion: "rise", tint: true },
  },
  listings: {
    title: "Production Service We Offer",
    items: [
      {
        key: "Photography",
        title: "Photography",
        text: "From Products And People To Lifestyle And Commercial Campaigns, We Create Photography That Gives Your Brand A Strong Visual Presence.",
        image: "/images/services/production-service/photography.webp",
        list: [
          "Product Photography",
          "Commercial Photography",
          "Lifestyle Photography",
          "Fashion Photography",
          "Corporate Photography",
          "Food Photography",
          "E-Commerce Photography",
          "Event Photography",
          "Architectural Photography",
          "Drone Photography",
        ],
      },
      {
        key: "Videography",
        title: "Videography",
        text: "We Produce Cinematic Video Content For Brands, Campaigns, Social Platforms And Corporate Communication — From Short-Form Content To Large-Scale Productions.",
        image: "/images/services/production-service/videography.webp",
        list: [
          "Corporate Films",
          "Advertising Films",
          "Social Media Videos",
          "Reels & Short Videos",
          "Promotional Videos",
          "Event Videography",
          "Interview Videos",
          "Product Videos",
          "Commercial Films",
          "Drone Videography",
        ],
      },
      {
        key: "Studio Production",
        title: "Studio Production",
        text: "A Professional Production Environment Equipped For Photography, Video, Interviews, Podcasts, Campaigns And Controlled Commercial Shoots.",
        image: "/images/services/production-service/studio-production.webp",
        list: ["Studio Space", "Professional Lighting", "Camera Equipment", "Product Setups", "Interview Setups", "Podcast Setups", "Production Crew", "Set Preparation"],
      },
      {
        key: "Post Production",
        title: "Post Production",
        text: "We Transform Captured Footage And Imagery Into Polished Final Content Through Editing, Color Grading, Sound Design, Visual Refinement And Finishing.",
        image: "/images/services/production-service/post-production.webp",
        list: ["Video Editing", "Color Grading", "Sound Design", "Retouching", "Visual Effects", "Motion Integration", "Content Adaptation", "Final Mastering"],
      },
    ],
  },
  details: {
    cta: { label: "Start A Production", href: "/contact#enquiry" },
    items: [
      {
        key: "Creative Direction",
        title: "Creative Direction",
        text: "We Shape The Creative Vision Behind The Production — From Concept And Visual References To Styling, Casting, Locations And The Final Visual Language.",
        example: "A Luxury Hospitality Brand Wants A Campaign That Communicates A Specific Mood, Requiring Creative Direction Across Location, Talent, Styling, Lighting And Visual Storytelling.",
        image: "/images/services/production-service/creative-direction.webp",
        layout: "wide",
        indent: true,
        exampleSide: "left",
      },
    ],
  },
  process: {
    title: "Process",
    image: {
      src: "/images/services/production-service/process-camera.webp",
      width: 493,
      height: 472,
      alt: "Mirrorless camera with a microphone windshield",
      glow: "rgba(120,40,220,0.45)",
      tint: "#6a24d6",
      box: { left: 27, top: 7.8, w: 45.7 },
    },
    steps: [
      { title: "Concept", tagline: "Start With The Story.", text: "We Define The Idea, Objective, Audience And Creative Direction." },
      { title: "Pre Production", tagline: "Prepare Every Detail.", text: "Scripts, Storyboards, Casting, Locations, Styling, Schedules And Production Planning." },
      { title: "Production", tagline: "Bring It To Life.", text: "Photography, Filming, Direction, Lighting, Cinematography And On-Set Execution." },
      { title: "Post Production", tagline: "Shape The Final Story.", text: "Editing, Colour Grading, Sound Design, Visual Effects And Finishing." },
      { title: "Delivery", tagline: "Ready For Every Screen.", text: "Final Masters And Platform-Specific Versions For Campaigns, Social Media, Websites And Advertising." },
    ],
  },
});

pages.push({
  category: "2D / 3D Motion / VFX",
  metaDescription:
    "2D motion, 3D animation, CGI and visual effects in Dubai — Hush Lush Technologies creates visuals that don't just explain an idea, they make people stop and look.",
  hero: {
    tag: "2D / 3D / VFX Solution",
    title: ["Make The", "Impossible Move."],
    intro:
      "We Combine Motion Design, 3D, CGI And Visual Effects To Create Visuals That Don't Just Explain An Idea — They Make People Stop And Look.",
    cta: { label: "Create Something Unreal", href: "/contact#enquiry" },
    image: {
      src: "/images/services/2d-3d-motion-vfx/hologram.webp",
      width: 714,
      height: 630,
      alt: "Holographic 3D wireframe head on a futuristic platform",
      box: { left: 42.6, top: 2.3, w: 55.5 },
      motion: "hologram",
    },
    ghost: ["2D / 3D", "VFX Solution"],
    ghostX: 27.2,
  },
  statement: {
    title: ["When Reality", "Isn’t Enough,", "We Build More."],
    paragraph:
      "From A Simple Animated Idea To A Fully Constructed Digital World, We Use Motion, 3D And Visual Effects To Give Brands A Visual Language Without Limits.",
    image: { src: "/images/services/2d-3d-motion-vfx/warrior.webp", width: 527, height: 1222, box: { left: 37.7, top: 12.6, w: 27.3 }, motion: "rise", tint: true },
  },
  listings: {
    title: "2D / 3D / VFX Service We Offer",
    items: [
      {
        key: "2D Motion",
        title: "2D Motion",
        text: "We Transform Static Ideas Into Engaging Motion Through Animation, Typography, Illustrations, Transitions And Visual Storytelling.",
        image: "/images/services/2d-3d-motion-vfx/2d-motion.webp",
        list: [
          "2D Animation",
          "Motion Graphics",
          "Typography Animation",
          "Infographic Animation",
          "Explainer Videos",
          "Animated Social Media Creatives",
          "Promotional Motion Graphics",
        ],
      },
      {
        key: "3D Motion",
        title: "3D Motion",
        text: "We Create Dimensional Worlds, Products And Environments Through 3D Modeling, Animation, Lighting And Rendering.",
        image: "/images/services/2d-3d-motion-vfx/3d-motion.webp",
        list: ["3D Animation", "3D Product Visualization", "Product Animation", "Architectural Animation", "3D Modeling", "3D Rendering", "Character Animation"],
      },
      {
        key: "CGI & VFX Service",
        title: "CGI & VFX",
        text: "We Combine CGI, Compositing And Visual Effects To Create Scenes, Products And Experiences That Would Be Impossible, Impractical Or Expensive To Capture Traditionally.",
        image: "/images/services/2d-3d-motion-vfx/cgi-and-vfx.webp",
        list: [
          "CGI Advertising",
          "CGI Product Commercials",
          "Visual Effects",
          "VFX for Advertising",
          "Green Screen Compositing",
          "Digital Environments",
          "Product Visualization",
          "AI-Assisted Visual Production",
        ],
      },
    ],
    banner: { src: "/images/services/2d-3d-motion-vfx/motion-studio.webp", alt: "Motion designer working on a 3D render across three monitors" },
  },
  process: {
    title: "Process",
    image: {
      src: "/images/services/2d-3d-motion-vfx/process-figure.webp",
      width: 800,
      height: 1112,
      alt: "Hooded 3D character render",
      glow: "rgba(150,40,220,0.45)",
      tint: "#8a2be2",
      dim: false,
      box: { left: 27, top: 4.3, w: 46 },
    },
    steps: [
      { title: "Concept", tagline: "Start With The Impossible.", text: "We Understand The Idea, Objective, Audience And Visual Direction." },
      { title: "Design", tagline: "Build The Visual Language.", text: "We Develop Storyboards, Style Frames, Concepts And Visual References." },
      { title: "Create", tagline: "Build The World.", text: "We Model, Animate, Simulate, Composite And Develop The Visual Elements." },
      { title: "Refine", tagline: "Make Every Pixel Count.", text: "Lighting, Materials, Motion, Effects, Colour And Compositing Are Refined." },
      { title: "Delivery", tagline: "Ready For Every Screen.", text: "Final Outputs Are Optimized For Advertising, Social Media, Websites, Presentations And Campaigns." },
    ],
  },
  faq: [
    {
      q: "What is the difference between 2D and 3D motion?",
      a: "2D motion works with flat graphic elements, typography, illustrations and visual compositions. 3D motion adds depth through modeling, lighting, materials, environments and camera movement.",
    },
    {
      q: "What kind of CGI can you create?",
      a: "We can create CGI product visuals, advertising sequences, product animations, digital environments and visual effects for campaigns.",
    },
    {
      q: "Can you create a product video before the product exists?",
      a: "Yes. 3D and CGI can be used to visualize products before physical production, allowing brands to market concepts and upcoming products.",
    },
    {
      q: "Do you create animated social media content?",
      a: "Yes. We create motion graphics, animated advertisements, typography animations, product animations and short-form motion content for social platforms.",
    },
    {
      q: "Can you combine real footage with CGI?",
      a: "Absolutely. VFX and compositing allow us to integrate CGI elements into real footage to create believable visual experiences.",
    },
    {
      q: "Do you provide logo animation?",
      a: "Yes. We can transform existing brand marks into motion identities suitable for videos, presentations, websites and digital platforms.",
    },
  ],
});

pages.push({
  category: "Digital Marketing",
  metaDescription:
    "Social media management, performance marketing, Meta, Google & YouTube ads, SEO and influencer marketing in Dubai — Hush Lush Technologies turns attention into growth.",
  hero: {
    tag: "Digital Marketing",
    title: ["Turn Attention", "Into Growth."],
    intro:
      "We Build Digital Growth Systems That Connect Strategy, Content, Advertising And Search — Turning Visibility Into Meaningful Business Results.",
    cta: { label: "Start Growing", href: "/contact#enquiry" },
    image: {
      src: "/images/services/digital-marketing/logo-gold.webp",
      width: 400,
      height: 389,
      alt: "Hush Lush mark surrounded by social media platforms",
      box: { left: 41.1, top: 8.5, w: 48 },
      motion: "orbit",
    },
    ghost: ["Digital", "Marketing"],
    ghostX: 38.6,
  },
  statement: {
    title: ["Reach People.", "Create Interest.", "Drive Action."],
    paragraph:
      "Digital Marketing Works Best When Every Channel Has A Purpose. We Connect Organic Content, Paid Media, Search, Influence And Performance Data To Build A System That Moves People From Discovery To Decision.",
    image: { src: "/images/services/digital-marketing/laptop.webp", width: 1000, height: 1120, box: { left: 21.6, top: 3.85, w: 59.4 }, motion: "rise" },
  },
  listings: {
    title: "Digital Marketing Service We Offer",
    items: [
      {
        key: "Social Media Management",
        title: "Social Media",
        text: "We Build And Manage Social Media Ecosystems That Combine Strategy, Content And Community To Keep Brands Relevant And Recognizable.",
        image: "/images/services/digital-marketing/social-media.webp",
        list: ["Social Media Management", "Social Media Marketing", "Content Strategy", "Community Management"],
        alias: ["Social Media Marketing", "Content Strategy"],
      },
      {
        key: "Performance Marketing",
        title: "Performance Marketing",
        text: "We Create, Manage And Optimize Paid Campaigns Designed Around Measurable Business Outcomes — Not Vanity Metrics.",
        image: "/images/services/digital-marketing/performance-marketing.webp",
        list: ["Meta Ads", "Google Ads", "YouTube Ads", "Performance Marketing", "Lead Generation", "Conversion Campaigns", "Retargeting", "Full-Funnel Advertising"],
        alias: ["Meta, Google & YouTube Ads"],
      },
      {
        key: "SEO / SEM / GEO / AEO",
        title: "Search Marketing",
        text: "We Combine SEO And Paid Search To Improve How Brands Appear When Customers Are Actively Looking For What They Offer.",
        image: "/images/services/digital-marketing/search-marketing.webp",
        list: ["SEO", "SEM", "Google Search Ads", "Google Display Ads", "Keyword Strategy", "Local Search", "Website Optimization", "Search Performance"],
        alias: ["Google Display & Search Ads"],
      },
      {
        key: "Influencer Marketing",
        title: "Influencer & Content Marketing",
        text: "We Connect Brands With Relevant Creators And Develop Content Strategies That Feel Authentic To The Audience Rather Than Forced Advertising.",
        image: "/images/services/digital-marketing/influencer-content.webp",
        list: ["Influencer Marketing", "Content Marketing", "Content Strategy", "Creator Campaigns", "Campaign Development"],
      },
      {
        key: "Email Marketing",
        title: "Email & PR",
        text: "We Help Brands Stay Connected With Their Audiences And Shape Meaningful Conversations Through Email Campaigns, Public Relations And Media Communication.",
        image: "/images/services/digital-marketing/email-pr.webp",
        list: ["Email Marketing", "PR Campaigns", "Media Campaigns", "Brand Communication", "Media Relations"],
        alias: ["PR & Media Campaigns"],
      },
    ],
  },
  insights: {
    eyebrow: "Every Campaign\nTells Us Something.",
    title: "We Use Performance Data To Understand What's Working, What's Changing And Where The Next Opportunity Is.",
    stats: [
      { value: 82, suffix: "K", label: "Reach" },
      { value: 34, prefix: "+", suffix: "%", label: "Conversion" },
      { value: 6.4, decimals: 1, suffix: "%", label: "Engagement" },
      { value: 3.8, decimals: 1, suffix: "X", label: "ROI" },
    ],
  },
  process: {
    title: "Process",
    image: {
      src: "/images/services/digital-marketing/process-rocket.webp",
      width: 674,
      height: 845,
      alt: "Rocket launching from a laptop surrounded by marketing icons",
      glow: "rgba(130,60,230,0.4)",
      tint: "#6b46c1",
      dim: false,
      box: { left: 27.9, top: -2.2, w: 43.2 },
    },
    steps: [
      { title: "Discover", tagline: "Understand The Audience.", text: "We Study Your Business, Market, Customers And Competitive Landscape." },
      { title: "Strategize", tagline: "Choose The Right Channels.", text: "We Build The Marketing Strategy, Campaign Architecture And Content Direction." },
      { title: "Launch", tagline: "Put The Strategy To Work.", text: "Campaigns, Content, Search, Advertising And Communication Go Live." },
      { title: "Optimize", tagline: "Follow The Data.", text: "We Continuously Test, Measure And Improve Campaign Performance." },
      { title: "Scale", tagline: "Double Down On What Works.", text: "Successful Campaigns Are Refined And Expanded To Create Sustainable Growth." },
    ],
  },
  faq: [
    {
      q: "What digital marketing services do you provide?",
      a: "We provide social media management, social media marketing, content strategy, paid advertising, SEO, SEM, GEO, AEO, influencer marketing, email marketing and PR/media campaigns.",
    },
    {
      q: "Do you manage social media accounts?",
      a: "Yes. We can handle strategy, content direction, publishing, community management and ongoing social media growth.",
    },
    {
      q: "Do you run Meta and Google Ads?",
      a: "Yes. We manage paid campaigns across Meta, Google and YouTube, including campaign setup, targeting, optimization and performance tracking.",
    },
    {
      q: "Do you provide SEO and SEM?",
      a: "Yes. We work across both organic search optimization and paid search advertising.",
    },
    {
      q: "What are GEO and AEO?",
      a: "GEO focuses on improving brand visibility within generative AI search experiences, while AEO focuses on making content more discoverable in answer-based search experiences.",
    },
    {
      q: "Can you generate leads through digital marketing?",
      a: "Yes. We can build lead-generation campaigns across paid social, search and other relevant digital channels, with conversion tracking to measure results.",
    },
  ],
});

pages.push({
  category: "Advertisement Solution",
  metaDescription:
    "Outdoor, transit, indoor, digital, retail and event advertising in Dubai — Hush Lush Technologies creates and places campaigns that get brands seen and remembered.",
  hero: {
    tag: "Advertisement",
    title: ["Be Seen.", "Be Remembered."],
    intro:
      "We Create And Place Advertising Experiences Across Physical And Digital Spaces — Turning Everyday Environments Into Opportunities For Brands To Get Noticed.",
    cta: { label: "Plan A Campaign", href: "/contact#enquiry" },
    image: {
      src: "/images/services/advertisement-solution/billboard.webp",
      width: 677,
      height: 677,
      alt: "Roadside billboard advertising campaign",
      box: { left: 43.2, top: 4.8, w: 52.7 },
      motion: "billboard",
    },
    ghost: ["Advertisement", "Solution"],
    ghostX: 42.6,
  },
  statement: {
    title: ["Don’t Just", "Buy Space.", "Own Attention."],
    paragraph:
      "The Right Message In The Right Place Can Change How People See A Brand. We Create Advertising Strategies That Connect Creative Ideas With High-Impact Environments And Audiences.",
    image: { src: "/images/services/advertisement-solution/kiosk.webp", width: 436, height: 1083, box: { left: 36.3, top: 4.4, w: 25.6 }, motion: "rise", tint: true },
  },
  listings: {
    title: "Advertisement Service We Offer",
    items: [
      {
        key: "Outdoor Advertising",
        title: "Outdoor Advertising",
        text: "We Place Brands In High-Visibility Outdoor Environments Designed To Reach Audiences At Scale.",
        image: "/images/services/advertisement-solution/outdoor.webp",
        list: ["Billboards", "Hoardings", "Gantries", "Building Advertising", "Large-Format Advertising", "Outdoor Campaigns"],
      },
      {
        key: "Transit Advertising",
        title: "Transit Advertising",
        text: "We Turn Buses, Taxis, Metro Environments And Other Transit Touchpoints Into Moving Brand Experiences.",
        image: "/images/services/advertisement-solution/transit.webp",
        list: ["Bus Branding", "Taxi Branding", "Metro Advertising", "Transit Advertising", "Vehicle Wraps", "Station Advertising"],
      },
      {
        key: "Indoor Advertising",
        title: "Indoor Advertising",
        text: "We Create Advertising Experiences Inside Malls, Commercial Buildings, Venues And High-Footfall Environments.",
        image: "/images/services/advertisement-solution/indoor.webp",
        list: ["Mall Advertising", "Indoor Displays", "Digital Screens", "Commercial Building Advertising", "Venue Advertising"],
      },
      {
        key: "Digital Advertising",
        title: "Digital Advertising",
        text: "We Create High-Impact Digital Advertising Experiences Across Screens, Digital Environments And Connected Platforms.",
        image: "/images/services/advertisement-solution/digital.webp",
        list: ["Digital Screens", "Digital Billboards", "Screen Advertising", "Digital Campaign Creative", "Interactive Advertising"],
      },
      {
        key: "Retail, Point-of-Sale & Kiosk Advertising",
        title: "Retail, POS & Kiosk Advertising",
        text: "We Bring Advertising Directly Into The Buying Environment Through Retail Displays, Point-Of-Sale Materials And Interactive Kiosks.",
        image: "/images/services/advertisement-solution/retail.webp",
        list: ["Retail Advertising", "Point-of-Sale Displays", "Kiosk Advertising", "Product Displays", "Promotional Displays", "In-Store Campaigns"],
      },
      {
        key: "Exhibition & Event Advertising",
        title: "Exhibition & Event Advertising",
        text: "We Transform Exhibitions, Launches And Events Into Branded Environments That Attract Attention And Create Memorable Experiences.",
        image: "/images/services/advertisement-solution/exhibition.webp",
        list: ["Exhibition Advertising", "Event Advertising", "Booth Advertising", "Stage Screens", "Event Displays", "Brand Activations"],
      },
    ],
  },
  process: {
    title: "Process",
    image: {
      src: "/images/services/advertisement-solution/process-truck.webp",
      width: 1100,
      height: 641,
      alt: "Truck wrapped as a giant chocolate bar — guerrilla advertising",
      glow: "rgba(130,60,230,0.4)",
      tint: "#6b46c1",
      dim: false,
      box: { left: 10.5, top: 8.6, w: 73.8 },
    },
    steps: [
      { title: "Discover", tagline: "Understand The Audience.", text: "We Identify Who You Want To Reach, Where They Spend Time And What Influences Their Attention." },
      { title: "Strategize", tagline: "Find The Opportunity.", text: "We Identify The Right Advertising Environments, Locations, Formats And Campaign Approach." },
      { title: "Create", tagline: "Build The Campaign.", text: "Our Creative Team Develops The Visual Concepts, Messaging And Advertising Assets." },
      { title: "Execute", tagline: "Put It Everywhere It Matters.", text: "We Coordinate Production, Placement, Installation And Campaign Rollout." },
      { title: "Amplify", tagline: "Make The Impact Bigger.", text: "We Connect Physical Advertising With Digital Campaigns And Other Brand Touchpoints Where Relevant." },
    ],
  },
  faq: [
    {
      q: "What types of advertising do you provide?",
      a: "We provide outdoor, transit, indoor, digital, retail, point-of-sale, kiosk, exhibition and event advertising solutions.",
    },
    {
      q: "Do you handle billboard and hoarding advertising?",
      a: "Yes. We can support outdoor campaigns including billboards, hoardings, gantries and other large-format advertising placements.",
    },
    {
      q: "Can you advertise on buses and taxis?",
      a: "Yes. Transit advertising can include buses, taxis, metro environments and other relevant transportation touchpoints.",
    },
    {
      q: "Do you provide digital screen advertising?",
      a: "Yes. We can develop creative assets and advertising campaigns for digital screens and large-format digital displays.",
    },
    {
      q: "Can you handle mall advertising?",
      a: "Yes. We can create advertising campaigns for malls and other high-footfall indoor environments, including screens, displays and promotional spaces.",
    },
    {
      q: "Do you design the advertising creative as well?",
      a: "Yes. Our Creative Solution team can develop the visual campaign assets while the Advertisement Solution team focuses on the advertising environment and execution.",
    },
  ],
});

pages.push({
  category: "Software Solution",
  metaDescription:
    "UI/UX design, websites, web apps, SaaS, mobile apps and e-commerce development in Dubai — Hush Lush Technologies builds digital systems that work.",
  hero: {
    tag: "Software Solution",
    title: ["Build Digital", "Systems That Work."],
    intro:
      "From Intelligent Interfaces To Scalable Applications, We Design And Develop Digital Products That Make Complex Businesses Simpler, Faster And More Connected.",
    cta: { label: "Build Your Product", href: "/contact#enquiry" },
    image: {
      src: "/images/services/software-solution/hero-coder.webp",
      width: 1024,
      height: 1024,
      alt: "Developer working across a wall of code monitors",
      box: { left: 44.5, top: 0, w: 52 },
      motion: "depth",
      depth: { src: "/images/services/software-solution/hero-coder-depth.png", size: [512, 512] },
    },
    ghost: ["Software", "Solution"],
    ghostX: 44,
  },
  statement: {
    title: ["Good Software", "Doesn’t Just Run.", "It Makes Things", "Flow."],
    paragraph:
      "We Combine Strategy, Experience Design And Engineering To Create Digital Products That Feel Simple For Users And Powerful For Businesses.",
    image: { src: "/images/services/software-solution/code-screen.webp", width: 736, height: 980, box: { left: 20.3, top: 4.4, w: 37.4 }, motion: "rise", tint: true },
  },
  listings: {
    title: "Software Service We Offer",
    items: [
      {
        key: "UI/UX Design",
        title: "UI/UX Design",
        text: "We Design Intuitive Digital Experiences That Balance User Needs, Business Goals And Visual Clarity Across Web And Mobile Products.",
        image: "/images/services/software-solution/ui-ux.webp",
        list: ["Interface Design", "User Experience Design", "Responsive Design", "Interactive Prototypes", "Design System", "Product Design", "CX Design", "UI Library", "Tailwind CSS Config File", "Reusable Component"],
      },
      {
        key: "UX Strategy",
        title: "UX Strategy",
        text: "We Define How Users Move Through A Product Before Visual Design And Development Begin.",
        image: "/images/services/software-solution/ux-strategy.webp",
        list: ["User Research", "User Flows", "Information Architecture", "Customer Journey", "Wireframing", "Usability Planning", "Competitor Analysis", "User Centric Design", "Human Centric Design"],
      },
      {
        key: "CX Design",
        title: "CX Design",
        text: "We Connect Every Customer Interaction Into One Consistent Experience \u2014 From First Contact To Support, Purchase And Retention.",
        image: "/images/services/software-solution/cx-design.webp",
        list: ["Customer Journey Design", "Touchpoint Mapping", "Service Experience", "Digital Customer Experience", "Experience Optimization", "Sprint Planning", "Module Planning"],
      },
      {
        key: "Website Development",
        title: "Website Development",
        text: "We Build Fast, Responsive And Scalable Websites Designed Around Business Goals, User Experience And Performance.",
        image: "/images/services/software-solution/website.webp",
        list: ["Corporate Websites", "E-Commerce", "Landing Pages", "CMS Websites", "Custom Websites", "Website Optimization", "Shopify Website", "WordPress Website"],
        alias: ["E - Commerce Solution"],
      },
      {
        key: "Web Application Development",
        title: "Website Application Development",
        text: "We Develop Powerful Web Applications That Bring Business Workflows, Users, Data And Operations Into One Connected Platform.",
        image: "/images/services/software-solution/web-app.webp",
        list: ["Custom Web Applications", "Admin Panels", "Customer Portals", "Business Dashboards", "Workflow Systems", "API Integration", "Payment Integration", "Third Party Integration", "Ticketing System"],
      },
      {
        key: "SaaS Development",
        title: "SaaS Development",
        text: "We Design And Develop Scalable Software Products That Can Serve Multiple Customers, Teams And Business Models Through One Intelligent Platform.",
        image: "/images/services/software-solution/saas.webp",
        list: ["SaaS Platforms", "Multi-Tenant Systems", "Subscription Systems", "Admin Dashboards", "User Management", "Analytics", "API Architecture", "Security Integration", "Server Optimizing"],
      },
      {
        key: "Mobile App Development",
        title: "Mobile App Development",
        text: "We Create Mobile Applications That Connect Customers, Employees And Businesses Through Intuitive Mobile Experiences.",
        image: "/images/services/software-solution/mobile-app.webp",
        list: ["Business Applications", "Customer Applications", "E-Commerce Apps", "Booking Apps", "Service Apps", "Mobile Platforms", "Hybrid Apps", "Animated UI App"],
      },
      {
        key: "iOS & Android Development",
        title: "iOS & Android Development",
        text: "We Build And Optimize Mobile Experiences For iOS And Android While Maintaining A Consistent Product Experience Across Devices.",
        image: "/images/services/software-solution/ios-android.webp",
        list: ["iOS Applications", "Android Applications", "Cross-Platform Development", "API Integration", "Backend Integration", "App Maintenance", "Ecosystem Builder"],
      },
    ],
  },
  process: {
    title: "Process",
    image: {
      src: "/images/services/software-solution/process-phone.webp",
      width: 454,
      height: 704,
      alt: "Curved smartphone showing an e-commerce app",
      glow: "rgba(140,60,240,0.45)",
      box: { left: 30, top: -3.5, w: 39.5 },
    },
    steps: [
      { title: "Discover", tagline: "Understand The Business.", text: "We Identify Your Users, Workflows, Challenges And Business Objectives." },
      { title: "Design", tagline: "Create The Experience.", text: "We Design Interfaces, Flows, Prototypes And Systems Before Development." },
      { title: "Strategize", tagline: "Define What To Build.", text: "We Structure The Product, Features, Architecture And User Experience." },
      { title: "Develop", tagline: "Build The Technology.", text: "Frontend, Backend, APIs, Databases And Integrations Come Together." },
      { title: "Test", tagline: "Break It Before Users Do.", text: "We Test Functionality, Responsiveness, Usability, Security And Performance." },
      { title: "Launch", tagline: "Put It Into The Real World.", text: "We Deploy, Monitor And Support The Product As It Grows." },
    ],
  },
  faq: [
    {
      q: "What type of software do you develop?",
      a: "We build websites, web applications, SaaS platforms, business systems, customer portals and mobile applications.",
    },
    {
      q: "Can you build a completely custom application?",
      a: "Yes. We can design and develop custom software around your specific business workflows, users and requirements.",
    },
    {
      q: "Do you develop both frontend and backend?",
      a: "Yes. We can handle the complete product development process, including frontend, backend, APIs, databases and third-party integrations.",
    },
    {
      q: "Can you develop SaaS products?",
      a: "Yes. We can develop scalable SaaS platforms with user management, subscriptions, dashboards, multi-tenant architecture and integrations.",
    },
    {
      q: "Can you build both iOS and Android apps?",
      a: "Yes. We can develop applications for iOS and Android, including cross-platform solutions where appropriate.",
    },
    {
      q: "Do you design the UI/UX before development?",
      a: "Yes. Our UI/UX process can include user flows, wireframes, interface design, prototypes and design systems before development begins.",
    },
  ],
});

export const SERVICE_PAGES: ServicePage[] = pages.map((p) => ({ ...p, slug: slugify(p.category) }));

export const getServicePage = (slug: string) => SERVICE_PAGES.find((p) => p.slug === slug);
