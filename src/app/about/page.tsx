import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import AboutHero from "@/components/about/AboutHero";
import Offer from "@/components/sections/Offer";
import CtaCreativity from "@/components/sections/CtaCreativity";
import AboutValues from "@/components/about/AboutValues";
import EverythingConnects from "@/components/about/EverythingConnects";
import WhyUs from "@/components/sections/WhyUs";
import Stats from "@/components/sections/Stats";
import IdeasFrame from "@/components/sections/IdeasFrame";
import Capabilities from "@/components/about/Capabilities";
import CrystalField from "@/components/about/CrystalField";
import LetsBuild from "@/components/sections/LetsBuild";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Hush Lush is a creative technology company bringing strategy, creativity, technology, production and growth together to build brands, experiences and digital products.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />

        <Offer />
        <CtaCreativity
          id="our-story"
          title="Who We Are?"
          headline={["More Than A", "Creative Agency."]}
          paragraph="Hush Lush Technologies Brings Together Strategists, Designers, Creators And Technologists To Help Brands Think Differently, Communicate Better And Build Experiences That Matter."
          primary={{ label: "Explore Our Service", href: "/#services" }}
          secondary={{ label: "Start The Project", href: "/contact" }}
          checklist={["Strategy", "Creative", "Technology", "Production", "Growth"]}
        />
        <AboutValues />
        <EverythingConnects />
        <WhyUs />
        <Stats />
        <IdeasFrame />
        <Capabilities />
        <CtaCreativity
          id="creativity-limits"
          headline={["Creativity", "Without Limits."]}
          paragraph="Different Disciplines. Different Perspectives. Different Ways Of Thinking. That's What Makes The Work Better."
          primary={{ label: "Explore Our Service", href: "/#services" }}
          secondary={{ label: "Start The Project", href: "/contact" }}
        >
          <CrystalField />
        </CtaCreativity>

        <LetsBuild
          id="build-whats-next"
          lines={["We Don’t Want To", "Follow What’s Next"]}
          headlineSize={2.2}
          accent="We Want To Build It"
          paragraph="The World Keeps Moving. Technology Keeps Evolving. We Want To Create What Moves It Forward."
        />
      </main>
    </>
  );
}
