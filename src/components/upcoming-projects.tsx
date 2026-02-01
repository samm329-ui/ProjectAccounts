"use client";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const phases = [
  {
    phase: 0,
    title: "MVP foundation",
    goals: ["Google Sheets backend", "Project list", "Payment timeline"],
    eta: "Q2 2026",
    progress: 95,
  },
  {
    phase: 1,
    title: "Team workflows",
    goals: ["Member ledger", "Passcode access", "Audit logs"],
    eta: "Q3 2026",
    progress: 60,
  },
  {
    phase: 2,
    title: "Client portal",
    goals: ["View-only links", "Client receipts", "Export CSV"],
    eta: "Q4 2026",
    progress: 40,
  },
  {
    phase: 3,
    title: "Automations",
    goals: ["Email receipts", "Recurring payments", "CSV sync"],
    eta: "Q1 2027",
    progress: 20,
  },
  {
    phase: 4,
    title: "Scale & Integrations",
    goals: ["Plugin for Dr. Drift", "Multi-brand support"],
    eta: "Q2 2027",
    progress: 5,
  },
];

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
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Upcoming Projects
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          A roadmap of our internal product rollouts — each phase includes
          goals and ETA.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="overflow-hidden rounded-lg bg-white/5 shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-600/50 px-3 py-1 text-sm font-semibold text-white">
                    Phase {phase.phase}
                  </span>
                  <div className="relative h-12 w-12">
                    <svg
                      className="h-full w-full"
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        className="text-gray-700"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                      />
                      <circle
                        className="text-purple-500"
                        strokeWidth="4"
                        strokeDasharray={`${phase.progress}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {phase.progress}%
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {phase.title}
                </h3>
                <ul className="mt-2 space-y-2">
                  {phase.goals.map((goal) => (
                    <li key={goal} className="flex items-center text-gray-400">
                      <svg
                        className="mr-2 h-4 w-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      {goal}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="text-sm">ETA: {phase.eta}</span>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-sm text-purple-400">
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
