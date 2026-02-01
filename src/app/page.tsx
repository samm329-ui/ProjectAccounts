import ScrollSequence from "@/components/ScrollSequence";
import { About } from "@/components/about";
import { Motto } from "@/components/motto";
import { UpcomingProjects } from "@/components/upcoming-projects";
import RippleGrid from "@/components/RippleGrid";

export default function Home() {
  return (
    <main className="bg-[#07070B]">
      <ScrollSequence />
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <RippleGrid
            gridColor="#BE62FF"
            rippleIntensity={0.02}
            gridSize={15}
            gridThickness={0.3}
            opacity={0.15}
            glowIntensity={0.05}
          />
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-16 md:space-y-24 lg:space-y-32 py-16 md:py-24 lg:py-32">
            <About />
            <Motto />
            <UpcomingProjects />
          </div>
        </div>
      </div>
    </main>
  );
}
