import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import CareersHero from "@/components/careers/CareersHero";
import CareerCulture from "@/components/careers/CareerCulture";
import WhyWorkWithUs from "@/components/careers/WhyWorkWithUs";
import OpenPositions from "@/components/careers/OpenPositions";
import LetsBuild from "@/components/sections/LetsBuild";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build your next chapter at Hush Lush Technologies — join strategists, creators and technologists building what's next in Dubai.",
  alternates: { canonical: "/careers" },
  openGraph: { url: "/careers" },
};

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main>
        <CareersHero />
        <CareerCulture />
        <WhyWorkWithUs />

        <OpenPositions />
        <LetsBuild
          id="ready-to-build"
          lines={["Ready To Build"]}
          paragraph="Whether There's An Open Role That Fits You Or An Idea You Want To Bring To The Table, We'd Love To Hear From You."
          cta={{ label: "View Open Positions", href: "#openings" }}
        />
      </main>
    </>
  );
}
