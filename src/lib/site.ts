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
    // Opens the "Hushlush Technologies" listing in Google Maps
    mapUrl: "https://maps.google.com/?cid=4215061153504247635",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d903.1949364739062!2d55.183791920834395!3d25.109316088807127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6baf3a249629%3A0x3a7ee7c9692b3f53!2sHushlush%20Technologies!5e0!3m2!1sen!2sin!4v1794488212287!5m2!1sen!2sin",
  },
  /**
   * Form handlers (our own API routes, which email the submission through Resend).
   * Recipients and the API key are set in environment variables — see src/lib/server/mail.ts.
   */
  careersFormEndpoint: "/api/careers",
  enquiryFormEndpoint: "/api/enquiry",
  careersEmail: "careers@hushlushtechnologies.com", // TODO: confirm
  socials: {
    instagram: "https://www.instagram.com/hushlush_technologies",
    youtube: "https://www.youtube.com/@HUSHLUSHTECH",
    tiktok: "https://www.tiktok.com/@hushlushtechnologies",
    facebook: "https://www.facebook.com/share/1HHN48L9Pk/",
  },
};
