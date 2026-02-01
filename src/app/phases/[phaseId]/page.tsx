'use client'

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { phases, type Phase } from '@/lib/phases';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PhaseDetailPage() {
  const params = useParams();
  const phaseId = params.phaseId;
  const phase: Phase | undefined = phases.find(
    (p) => p.phase.toString() === phaseId
  );

  if (!phase) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white">
        Phase not found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#07070B] custom-bg text-foreground p-4 sm:p-8"
    >
      <div className="mx-auto max-w-6xl">
        <Link href="/#upcoming-projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <motion.div
          layoutId={`phase-card-${phase.phase}`}
          className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="rounded-full bg-white/10 px-4 py-2 text-lg font-medium text-foreground self-start">
              Phase {phase.phase}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold">{phase.title}</h1>
          </div>
          
          {phase.status && (
            <div className="mt-4">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  phase.status === "On going"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {phase.status}
              </span>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Goals</h2>
                  <ul className="space-y-2 text-muted-foreground">
                      {phase.goals.map((goal) => (
                          <li key={goal} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-primary/50 shrink-0"></span>
                              <span>{goal}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              {phase.projects && phase.projects.length > 0 && (
                  <div>
                      <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Projects</h2>
                      <div className="space-y-3">
                          {phase.projects.map((project) => (
                              <div key={project} className="rounded-lg bg-white/5 p-4 border border-white/10">
                                  <p className="font-medium text-foreground">{project}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-sm text-muted-foreground">
              <p>ETA: {phase.eta}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
