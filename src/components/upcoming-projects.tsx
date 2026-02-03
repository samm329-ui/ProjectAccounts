"use client";
import MagicBento from './MagicBento'

export function UpcomingProjects() {
  return (
    <section
      id="upcoming-projects"
      aria-labelledby="upcoming-projects-heading"
      className="relative"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-px bg-white/10" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              Future Expansion
            </p>
            <div className="w-12 h-px bg-white/10" />
          </div>

          <h2
            id="upcoming-projects-heading"
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Institutional Roadmap
          </h2>
          <p className="max-w-2xl text-lg text-white/40 font-medium">
            A strategic phased rollout of internal product modules. Each phase is a
            milestone toward <span className="text-white/60">uncompromised operational sovereignty.</span>
          </p>
        </div>

        <div className="flex items-center justify-center relative">
          {/* Subtle Backlighting for the Grid */}
          <div className="absolute inset-0 bg-[#6B5DF9]/5 blur-[160px] rounded-full scale-150" />

          <div className="relative w-full flex justify-center">
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight
              enableBorderGlow={true}
              enableTilt
              enableMagnetism={false}
              clickEffect
              spotlightRadius={370}
              particleCount={12}
              glowColor="132, 0, 255"
              disableAnimations={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
