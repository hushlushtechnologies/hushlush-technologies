// Central site config — used for SEO metadata, sitemap and schema.
export const siteConfig = {
  name: "Hushlush Technologies",
  url: "https://www.hushlushtechnologies.com", // TODO: replace with real domain
  title: "Hushlush Technologies — We Build What's Next",
  description:
    "A creative technology company combining strategy, design, media and digital experiences to help ambitious brands grow.",
  ogImage: "/og-image.jpg", // TODO: add 1200x630 image in /public
  contact: {
    phone: "+971 54 232 21279",
    email: "marketing@hushlushtechnologies.com", // TODO: confirm — design shows no domain ending
    address: "Office No. 501 Al Zarouni Business Center, Al Barsha 1, Sheikh Zayed Road, Dubai",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Zarouni+Business+Center+Al+Barsha+1+Dubai",
  },
  /**
   * Form handlers (our own API routes, which email the submission through Resend).
   * Recipients and the API key are set in environment variables — see src/lib/server/mail.ts.
   */
  careersFormEndpoint: "/api/careers",
  enquiryFormEndpoint: "/api/enquiry",
  careersEmail: "careers@hushlushtechnologies.com", // TODO: confirm
  socials: {
    instagram: "",
    youtube: "",
    tiktok: "",
    facebook: "",
  },
};
