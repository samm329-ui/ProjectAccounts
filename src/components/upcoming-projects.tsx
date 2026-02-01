"use client";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import phases from "@/lib/phases.json";

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-10 w-10">
      <svg
        className="h-full w-full"
        width="36"
        height="36"
        viewBox="0 0 36 36"
      >
        <circle
          className="stroke-current text-white/10"
          strokeWidth="3"
          fill="transparent"
          r={radius}
          cx="18"
          cy="18"
        />
        <motion.circle
          className="stroke-current text-primary"
          strokeWidth="3"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="18"
          cy="18"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
        {progress}%
      </span>
    </div>
  );
};

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
          {phases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-foreground">
                    Phase {phase.phase}
                  </span>
                  <ProgressRing progress={phase.progress} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {phase.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {phase.goals.map((goal) => (
                    <li key={goal} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/10 px-6 py-3 mt-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{phase.eta}</span>
                    </div>
                    <a href="#" className="font-semibold text-foreground/80 transition hover:text-foreground">
                        Details →
                    </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
