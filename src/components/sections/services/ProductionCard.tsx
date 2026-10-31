"use client";

import { cn } from "@/lib/utils";
import {
  BentoCard,
  Eyebrow,
  Kicker,
  ParallaxLayer,
  titleClass,
} from "./shared";

const COL_A = ["Cinematic", "Product", "Lifestyle", "Fashion"];
const COL_B = ["Events", "AI / CGI", "Campaigns", "Commercials"];

/** Endless vertical marquee of tiles (pure CSS, pauses on hover) */
function TileColumn({
  items,
  reverse,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div className="relative -my-[60px] h-[calc(100%+120px)] overflow-hidden">
      <ul
        className={cn(
          "flex flex-col gap-3 group-hover/card:[animation-play-state:paused] motion-reduce:animate-none",
          reverse
            ? "animate-[marquee-down_14s_linear_infinite]"
            : "animate-[marquee-up_14s_linear_infinite]",
        )}
      >
        {loop.map((t, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className="grid h-[74px] shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-[#130e1a] text-sm font-semibold text-text-primary/95 lg:text-base"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductionCard({ className }: { className?: string }) {
  return (
    <BentoCard className={className} depth={80} phase={3.1}>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#0e0b13,#0a080d)]"
      />
      <div className="relative z-10 flex h-full min-h-[265px] flex-col justify-center py-7 pl-6 pr-[clamp(190px,58%,320px)] lg:pl-[23px]">
        <Eyebrow>Production</Eyebrow>
        <Kicker className="mt-4">Turn Ideas Into Visuals</Kicker>
        <h3 className={cn(titleClass, "mt-3 text-[26px] lg:text-[34px]")}>
          Made To Be
          <br />
          Seen
        </h3>
      </div>

      {/* Two tile columns scrolling in opposite directions, faded at the edges */}
      <div className="absolute inset-y-0 right-0 z-10 grid w-[clamp(180px,55%,300px)] grid-cols-2 gap-[10px] pr-5 [mask-image:linear-gradient(180deg,transparent,#000_18%,#000_82%,transparent)]">
        {/* columns also slide against each other with scroll */}
        <ParallaxLayer amount={-45} className="h-full">
          <TileColumn items={COL_A} />
        </ParallaxLayer>
        <ParallaxLayer amount={45} className="h-full">
          <TileColumn items={COL_B} reverse />
        </ParallaxLayer>
      </div>
    </BentoCard>
  );
}
