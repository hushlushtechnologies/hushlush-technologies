import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import EnquiryForm from "@/components/contact/EnquiryForm";
import LetsBuild from "@/components/sections/LetsBuild";

export const metadata: Metadata = {
  title: "Start The Project",
  description:
    "Have an idea, a challenge or a vision in mind? Start the conversation with Hush Lush Technologies and let's build what's next together.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactHero />
        <ContactInfo />
        <EnquiryForm />
        <LetsBuild
          id="ready-to-build"
          lines={["Ready To Build"]}
          paragraph="Whether There's An Open Role That Fits You Or An Idea You Want To Bring To The Table, We'd Love To Hear From You."
          cta={{ label: "View Open Position", href: "/careers#openings" }}
        />
      </main>
    </>
  );
}
