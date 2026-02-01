"use client";
import MagicBento from './MagicBento'

export function UpcomingProjects() {
  return (
    <section
      id="upcoming-projects"
      aria-labelledby="upcoming-projects-heading"
      className="py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="upcoming-projects-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Upcoming Projects
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A roadmap of our internal product rollouts — each phase includes
          goals and ETA.
        </p>

        <div className="mt-12 flex items-center justify-center">
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
    </section>
  );
}
