// All navigation content lives here so it's easy to edit.

export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
];

export type ServiceCategory = { title: string; items: string[] };

export const serviceCategories: ServiceCategory[] = [
  {
    title: "Branding & Identity",
    items: ["Brand Strategy", "Brand Identity", "Corporate Identity", "Brand Application"],
  },
  {
    title: "Production Service",
    items: ["Photography", "Videography", "Studio Production", "Creative Direction", "Post Production"],
  },
  {
    title: "2D / 3D Motion / VFX",
    items: ["2D Motion", "3D Motion", "CGI & VFX Service"],
  },
  {
    title: "Digital Marketing",
    items: [
      "Social Media Management",
      "Social Media Marketing",
      "Content Strategy",
      "Meta, Google & YouTube Ads",
      "Performance Marketing",
      "SEO / SEM / GEO / AEO",
      "Google Display & Search Ads",
      "Influencer Marketing",
      "Email Marketing",
      "PR & Media Campaigns",
    ],
  },
  {
    title: "Advertisement Solution",
    items: [
      "Outdoor Advertising",
      "Transit Advertising",
      "Indoor Advertising",
      "Digital Advertising",
      "Retail, Point-of-Sale & Kiosk Advertising",
      "Exhibition & Event Advertising",
    ],
  },
  {
    title: "Software Solution",
    items: [
      "UI/UX Design",
      "UX Strategy",
      "CX Design",
      "Website Development",
      "Web Application Development",
      "SaaS Development",
      "Mobile App Development",
      "iOS & Android Development",
      "E - Commerce Solution",
    ],
  },
  {
    title: "Creative Solution",
    items: [
      "Graphic Design",
      "Promotion Design",
      "Printable Design",
      "Corporate Design",
      "Business Design",
      "Stationery Design",
      "Social Media Creative Design",
    ],
  },
];

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const serviceHref = (category: string, item?: string) =>
  item ? `/services/${slugify(category)}#${slugify(item)}` : `/services/${slugify(category)}`;
