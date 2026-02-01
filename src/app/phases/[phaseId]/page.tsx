'use client'

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { phases, type Phase } from '@/lib/phases';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PhaseDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  if (phase.status === 'Upcoming') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#07070B] custom-bg text-foreground p-4 sm:p-8"
      >
        <div className="mx-auto max-w-4xl">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} />
            Back
          </button>
          <motion.div
            layoutId={`phase-card-${phase.phase}`}
            className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 sm:p-8 flex items-center justify-center min-h-[300px]"
          >
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold capitalize mb-4">Coming Soon</h1>
              <p className="text-muted-foreground">This project is under development. Check back later!</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
      <div className="mx-auto max-w-4xl">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Back
        </button>
        <motion.div
          layoutId={phase.phase === 0 ? undefined : `phase-card-${phase.phase}`}
          className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 sm:p-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center capitalize">
            {phase.title}
          </h1>
          
          {phase.projects && phase.projects.length > 0 ? (
            <div className="space-y-4">
              {phase.projects.map((project) => {
                const isComingSoon =
                  project === 'project dr drift' ||
                  project === 'project alklyne';
                const projectUrl = isComingSoon
                  ? '/coming-soon'
                  : `/projects/${project.replace(/\s+/g, '-')}`;

                return (
                  <div
                    key={project}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-4 border border-white/10 transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    <p className="font-medium text-foreground capitalize">
                      {project.replace(/[-_]/g, ' ')}
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={projectUrl}>
                        Open
                        <ExternalLink size={14} className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No projects in this phase yet.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
