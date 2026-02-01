"use client";
import { motion } from "framer-motion";
import phases from "@/lib/phases.json";

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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {phases.map((phase: any, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-foreground">
                    Phase {phase.phase}
                  </span>
                  {phase.status && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        phase.status === "On going"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {phase.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
