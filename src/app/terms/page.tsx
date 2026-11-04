import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import LegalDoc, { type LegalSection } from "@/components/legal/LegalDoc";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you use the Hush Lush Technologies website and services.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
};

// NOTE: general template — have it reviewed before launch.
const UPDATED = "07/09/2026";
const { email, phone } = siteConfig.contact;
const mail = <a href={`mailto:${email}`}>{email}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    nav: "Acceptance Of Terms",
    title: "Acceptance Of Terms",
    body: <p>By accessing or using this website, you agree to these Terms & Conditions. If you do not agree, please do not use the website.</p>,
  },
  {
    id: "our-services",
    nav: "Our Services",
    title: "Our Services",
    body: (
      <p>
        Hush Lush Technologies provides branding, creative, production, motion and VFX, digital marketing, advertising and software services. The scope, timelines,
        deliverables and fees for any project are agreed separately in a written proposal or agreement, which takes priority over these terms.
      </p>
    ),
  },
  {
    id: "website-use",
    nav: "Use Of The Website",
    title: "Use Of The Website",
    body: (
      <p>
        You agree to use this website lawfully and not to attempt to disrupt it, gain unauthorised access to it, or use it to send harmful, misleading or unlawful
        content.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    nav: "Intellectual Property",
    title: "Intellectual Property",
    body: (
      <p>
        All content on this website — including text, graphics, logos, images, animations and code — belongs to Hush Lush Technologies or its licensors and may not be
        copied, reproduced or distributed without written permission. Ownership of project deliverables is set out in each client agreement.
      </p>
    ),
  },
  {
    id: "enquiries",
    nav: "Enquiries & Quotes",
    title: "Enquiries & Quotes",
    body: (
      <p>
        Submitting an enquiry or application through this website does not create a contract. Any quotation we provide is valid for the period stated and becomes
        binding only once accepted in writing by both parties.
      </p>
    ),
  },
  {
    id: "liability",
    nav: "Limitation Of Liability",
    title: "Limitation Of Liability",
    body: (
      <p>
        The website is provided on an &quot;as is&quot; basis. While we aim to keep information accurate and up to date, we do not guarantee that it is complete or
        error-free, and we are not liable for any loss arising from use of the website, to the extent permitted by law.
      </p>
    ),
  },
  {
    id: "third-party-links",
    nav: "Third Party Links",
    title: "Third-Party Links",
    body: <p>This website may link to third-party websites. We are not responsible for their content, policies or practices.</p>,
  },
  {
    id: "governing-law",
    nav: "Governing Law",
    title: "Governing Law",
    body: <p>These terms are governed by the laws of the United Arab Emirates and the Emirate of Dubai.</p>,
  },
  {
    id: "changes",
    nav: "Changes To These Terms",
    title: "Changes To These Terms",
    body: <p>We may update these terms from time to time. Changes will appear on this page with an updated Last Updated date.</p>,
  },
  {
    id: "contact-us",
    nav: "Contact Us",
    title: "Contact Us",
    body: (
      <p>
        Hush Lush Technologies
        <br />
        Email: {mail}
        <br />
        Phone: <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
        <br />
        Location: Dubai, United Arab Emirates
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <LegalDoc
          tag="Legal Policy"
          title="Terms & Conditions"
          intro="These terms explain the rules for using the Hush Lush Technologies website and how we work with clients who contact us through it."
          updated={UPDATED}
          sections={SECTIONS}
        />
      </main>
    </>
  );
}
