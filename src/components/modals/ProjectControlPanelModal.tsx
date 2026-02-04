'use client';

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LayoutGrid,
  Settings,
  Users,
  Shield,
  ArrowRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const panelCards = [
  {
    icon: LayoutGrid,
    title: 'Dashboard',
    description: 'High-level overview and financial summary.',
    permission: 'Read-Only',
    permissionIcon: LayoutGrid, // Using slightly different icons to match visual weight if needed, or same
    href: '/projects/website-freelancing/dashboard',
    cta: 'View Dashboard',
  },
  {
    icon: Settings, // Gear icon as per ref (approx)
    title: 'Admin',
    description: 'Manage clients, costs, payments, and logs.',
    permission: 'Full System Access',
    permissionIcon: Shield,
    href: '/projects/website-freelancing/admin',
    cta: 'Enter Admin Console',
    isPrimary: true,
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Track personal ledger and project expenses.',
    permission: 'Team Scoped',
    permissionIcon: Users,
    href: '/projects/website-freelancing/team',
    cta: 'Access Team Panel',
  },
];

export function ProjectControlPanelModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-[100dvh] max-w-none m-0 p-0 md:h-auto md:w-auto md:max-w-5xl md:m-auto md:p-12 md:rounded-[32px] bg-[#0F0F13]/95 md:bg-[#0B0710]/40 backdrop-blur-3xl border-none md:border border-white/[0.08] text-foreground flex flex-col md:block overflow-y-auto overflow-x-hidden gap-0 shadow-2xl">

        {/* Accessible Title for Screen Readers */}
        <VisuallyHidden.Root>
          <DialogTitle>Website Freelancing — Control Panel</DialogTitle>
        </VisuallyHidden.Root>

        {/* Background Gradients (Desktop Only mainly) */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none hidden md:block" />

        {/* Close Button (Desktop) */}
        <DialogClose className="absolute right-8 top-8 rounded-full p-2 bg-white/5 hover:bg-white/10 transition-colors hidden md:flex text-white/60 hover:text-white">
          <X size={20} />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Mobile Header / Desktop Header Wrapper */}
        <div className="flex-none p-6 pt-12 md:p-0 md:mb-12 relative z-10">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-medium mb-6 md:mb-8"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Website Freelancing — Control Panel
            </h2>
            <p className="text-[#6B6F85] text-sm md:text-base">
              Select how you want to access this project
            </p>
          </div>
        </div>

        {/* Cards Container */}
        <div className="flex-1 p-6 md:p-0 overflow-y-auto md:overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 pb-12 md:pb-0">
            {panelCards.map((card, i) => (
              <Link href={card.href} key={card.title} className="block h-full">
                <motion.div
                  className={`group relative flex flex-col justify-between rounded-2xl md:rounded-3xl border p-6 md:p-7 h-full min-h-[220px] md:min-h-[340px] transition-all duration-300 ease-out
                    ${card.isPrimary
                      ? 'bg-gradient-to-br from-[#1A1B24] to-[#0D0D12] border-white/10 md:border-white/15 shadow-2xl shadow-purple-900/10'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Primary Glow */}
                  {card.isPrimary && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-2xl md:rounded-3xl" />
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-5 md:mb-8">
                      <card.icon
                        className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${card.isPrimary ? 'text-white' : 'text-[#6B6F85] group-hover:text-white'}`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Text */}
                    <div className="mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[#6B6F85] leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 md:mt-auto space-y-4">
                    {/* Permission Label */}
                    <div className="flex items-center gap-2 text-xs font-medium">
                      {card.isPrimary ? (
                        <Shield size={12} className="text-white/60" />
                      ) : (
                        <card.permissionIcon size={12} className="text-[#6B6F85]" />
                      )}
                      <span className={card.isPrimary ? 'text-white/60' : 'text-[#6B6F85]'}>{card.permission}</span>
                    </div>

                    {/* CTA */}
                    <div>
                      <div className={`w-full h-11 md:h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all
                                ${card.isPrimary
                          ? 'bg-white/10 border border-white/10 text-white hover:bg-white/15'
                          : 'bg-transparent border border-white/5 text-[#6B6F85] group-hover:text-white group-hover:border-white/20'
                        }`}>
                        {card.cta}
                        <ArrowRight size={14} />
                      </div>

                      {/* Warning Text for Admin */}
                      {card.isPrimary && (
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                          <Shield size={10} className="text-[#6B6F85]" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6F85]">
                            Changes affect financial records
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
