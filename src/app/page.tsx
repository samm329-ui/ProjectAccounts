import ScrollSequence from "@/components/ScrollSequence";
import { About } from "@/components/about";
import { Motto } from "@/components/motto";
import { UpcomingProjects } from "@/components/upcoming-projects";
import RippleGrid from "@/components/RippleGrid";

import MobileHero from "@/components/MobileHero";
import MobileClarityCard from "@/components/MobileClarityCard";
import MobileRoadmap from "@/components/MobileRoadmap";

export default function Home() {
  return (
    <main className="bg-[#07070B] min-h-screen">
      {/* DESKTOP ONLY: Scroll Sequence */}
      <div className="hidden md:block">
        <ScrollSequence />
      </div>

      {/* MOBILE ONLY: Custom Landing Experience */}
      <div className="block md:hidden space-y-8">
        <MobileHero />
        <MobileClarityCard />
        <MobileRoadmap />

        {/* Mobile Footer/Closing to match the 'Secured & Audited' from desktop footer if needed, 
            but reference image ends at Roadmap. 
            I will leave it clean as per "Mobile UI must look exactly like the provided image".
        */}
      </div>

      {/* DESKTOP CONTENT SECTIONS (Hidden on Mobile to enforce strict mobile layout) */}
      <div className="hidden md:block">
        {/* 2. Institutional Preface (Transition) */}
        <section className="relative z-10 py-32 md:py-48 bg-[#07070B]">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-[#6B5DF9] text-xs font-black uppercase tracking-[0.3em] mb-8">Institutional Standard</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Financial discipline built for <br />
              <span className="text-white/40">serious institutional growth.</span>
            </h2>
          </div>
        </section>

        {/* 3. The Trust & Assurance Grid (Ripple Controlled) */}
        <div className="relative isolate border-t border-white/[0.03]">
          <div className="absolute inset-0 -z-10">
            <RippleGrid
              gridColor="#BE62FF"
              rippleIntensity={0.01}
              gridSize={20}
              gridThickness={0.2}
              opacity={0.1}
              glowIntensity={0.05}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6">
            <div className="space-y-48 py-24 md:py-48">
              {/* 4. Core Accountability Pillar */}
              <div id="accountability-pillar" className="scroll-mt-32">
                <About />
              </div>

              {/* 5. Philosophy & Mission */}
              <div id="mission-pillar" className="relative">
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full" />
                <Motto />
              </div>

              {/* 6. Expansion Roadmap */}
              <div id="roadmap-pillar" className="scroll-mt-32">
                <UpcomingProjects />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Institutional Closing */}
        <footer className="py-24 border-t border-white/[0.03] text-center bg-[#07070B]">
          <div className="mx-auto max-w-2xl px-6">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.5em] mb-4">Secured & Audited</p>
            <p className="text-white/40 text-sm italic font-serif">"Absolute control over every rupee."</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
