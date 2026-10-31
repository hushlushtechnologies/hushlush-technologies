import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/services/Services";
import Offer from "@/components/sections/Offer";
import Ecosystem from "@/components/sections/Ecosystem";
import IdeasFrame from "@/components/sections/IdeasFrame";
import Showcase from "@/components/sections/Showcase";
import ServiceGrid from "@/components/sections/ServiceGrid";
import WhyUs from "@/components/sections/WhyUs";
import Stats from "@/components/sections/Stats";
import CtaCreativity from "@/components/sections/CtaCreativity";
import LetsBuild from "@/components/sections/LetsBuild";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <Services />
        <Offer />
        <Ecosystem />
        <IdeasFrame />
        <Showcase />
        <ServiceGrid />
        <WhyUs />
        <Stats />
        <CtaCreativity />
        <LetsBuild />
      </main>
    </>
  );
}
