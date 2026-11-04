import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import LegalDoc, { type LegalSection } from "@/components/legal/LegalDoc";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hush Lush Technologies collects, uses, protects and manages your personal information.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { url: "/privacy-policy" },
};

const UPDATED = "07/09/2026";
const { email, phone } = siteConfig.contact;
const mail = <a href={`mailto:${email}`}>{email}</a>;
const tel = <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    nav: "Who We Are",
    title: "Who We Are",
    body: (
      <>
        <p>
          Hush Lush Technologies is a creative, marketing and technology solutions company providing services including branding, creative solutions, software
          development, digital marketing, production, motion graphics, VFX and advertising solutions.
        </p>
        <p>For the purposes of this Privacy Policy:</p>
        <p>
          Company: Hush Lush Technologies
          <br />
          Location: Dubai, United Arab Emirates
          <br />
          Email: {mail}
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    nav: "Information We Collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We may collect information such as:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Company name</li>
          <li>Project requirements</li>
          <li>Messages and enquiries</li>
          <li>Technical information such as IP address, browser and device type</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    nav: "Cookies",
    title: "Cookies",
    body: (
      <p>
        Our website may use cookies and analytics tools to improve functionality, understand website usage and measure performance. You can manage cookies through your
        browser settings.
      </p>
    ),
  },
  {
    id: "third-party-services",
    nav: "Third Party Services",
    title: "Third-Party Services",
    body: (
      <p>
        We may use trusted third-party services for hosting, analytics, communication, marketing, forms and other business operations. We do not sell or rent your
        personal information.
      </p>
    ),
  },
  {
    id: "data-security",
    nav: "Data Security",
    title: "Data Security",
    body: (
      <p>
        We take reasonable measures to protect your information from unauthorized access, misuse, loss or disclosure. However, no online system can be guaranteed to be
        completely secure.
      </p>
    ),
  },
  {
    id: "your-rights",
    nav: "Your Rights",
    title: "Your Rights",
    body: <p>Depending on applicable law, you may request to access, correct or delete your personal information, or withdraw consent where applicable.</p>,
  },
  {
    id: "third-party-links",
    nav: "Third Party Links",
    title: "Third-Party Links",
    body: <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices or content.</p>,
  },
  {
    id: "policy-updates",
    nav: "Policy Updates",
    title: "Policy Updates",
    body: <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated Last Updated date.</p>,
  },
  {
    id: "contact-us",
    nav: "Contact Us",
    title: "Contact Us",
    body: (
      <>
        <p>For privacy-related questions or requests:</p>
        <p>
          Hush Lush Technologies
          <br />
          Email: {mail}
          <br />
          Phone: {tel}
          <br />
          Location: Dubai, United Arab Emirates
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        <LegalDoc
          tag="Legal Policy"
          title="Privacy Policy"
          intro="Your privacy matters to us. This policy explains how Hush Lush Technologies collects, uses, protects, and manages your personal information when you interact with our website and services."
          updated={UPDATED}
          sections={SECTIONS}
          outro={
            <>
              <h2 className="font-display text-[22px] font-bold">Your Privacy Matters</h2>
              <p>We value your trust and are committed to handling your personal information responsibly.</p>
              <p>If you have any questions or privacy-related concerns, our team is here to assist you.</p>
            </>
          }
        />
      </main>
    </>
  );
}
