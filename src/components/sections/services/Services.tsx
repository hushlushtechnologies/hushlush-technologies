"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { SectionScroll } from "./shared";
import StrategyCard from "./StrategyCard";
import CreativityCard from "./CreativityCard";
import ProductionCard from "./ProductionCard";
import TechCard from "./TechCard";
import { CtaCard, GrowthCard } from "./SmallCards";

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/**
 * Services bento grid (Figma: 1280px content, two rows)
 *  Row 1 → Strategy (711) | Creativity + Production (538)
 *  Row 2 → Growth + CTA (362) | Technology (887)
 */
export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <SectionScroll.Provider value={scrollYProgress}>
      <section
        ref={ref}
        id="services"
        aria-labelledby="services-title"
        className="relative scroll-mt-24 py-20 lg:py-32"
      >
        <h2 id="services-title" className="sr-only">
          What We Do — Strategy, Creativity, Production and Technology
        </h2>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="container-site grid gap-5 lg:gap-[30px]"
        >
          {/* Row 1 */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[711fr_538fr] lg:gap-[30px]">
            <StrategyCard className="md:row-span-2 lg:h-[559px]" />
            <CreativityCard className="lg:h-[264px]" />
            <ProductionCard className="lg:h-[265px]" />
          </div>

          {/* Row 2 */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[362fr_887fr] lg:gap-[30px]">
            <div className="grid gap-5 lg:gap-[30px]">
              <GrowthCard className="lg:h-[186px]" />
              <CtaCard className="lg:h-[186px]" />
            </div>
            <TechCard className="lg:h-[403px]" />
          </div>
        </motion.div>
      </section>
    </SectionScroll.Provider>
  );
}
