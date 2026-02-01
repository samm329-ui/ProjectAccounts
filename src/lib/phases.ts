import phasesData from './phases.json';

export type Phase = {
  phase: number;
  title: string;
  goals: string[];
  eta: string;
  progress: number;
  status: "On going" | "Upcoming";
};

export const phases: Phase[] = phasesData;
