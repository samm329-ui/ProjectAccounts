'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  LayoutDashboard,
  UserCog,
  Users,
  Shield,
  Eye,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const panelCards = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'High-level overview and financial summary.',
    permission: 'View Only',
    permissionIcon: Eye,
    href: '/projects/website-freelancing/dashboard',
  },
  {
    icon: UserCog,
    title: 'Admin',
    description: 'Manage clients, costs, payments, and logs.',
    permission: 'Full Access',
    permissionIcon: Shield,
    href: '/projects/website-freelancing/admin',
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Track personal ledger and project expenses.',
    permission: 'Team Access',
    permissionIcon: Users,
    href: '/projects/website-freelancing/team',
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
      <DialogContent className="max-w-[90vw] md:max-w-4xl bg-[#0F0F13] backdrop-blur-3xl border-white/[0.08] text-foreground p-6 sm:p-8 md:p-12 rounded-3xl">
        <DialogHeader className="text-center mb-6 md:mb-8">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Website Freelancing — Control Panel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm md:text-base mt-2">
            Select how you want to access this project
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {panelCards.map((card, i) => (
            <Link href={card.href} passHref key={card.title}>
              <motion.div
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 md:p-8 h-full min-h-[200px] md:min-h-[280px] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                  ${i === 1
                    ? 'md:scale-105 md:z-10 border-white/20 bg-white/[0.06] shadow-2xl shadow-purple-500/10'
                    : 'border-white/[0.06] bg-white/[0.04] hover:border-white/10'
                  }`}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient - stronger for Admin */}
                <div className={`absolute inset-0 transition-all duration-300 pointer-events-none ${i === 1
                  ? 'bg-gradient-to-br from-[#8B5CF6]/15 via-[#6366F1]/10 to-transparent'
                  : 'bg-gradient-to-r from-[#6B5DF9]/0 via-[#9F6FFF]/0 to-[#5CE7F4]/0 group-hover:from-[#6B5DF9]/10 group-hover:via-[#9F6FFF]/10 group-hover:to-[#5CE7F4]/10'
                  }`}></div>

                {/* Border glow */}
                <div className={`absolute -inset-px rounded-2xl border transition-all duration-300 pointer-events-none ${i === 1 ? 'border-white/20' : 'border-transparent group-hover:border-white/10'
                  }`}></div>

                <div className="relative z-10">
                  <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                    <card.icon className={`${i === 1 ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'} text-primary transition-transform group-hover:scale-110`} />
                    <h3 className={`${i === 1 ? 'text-xl md:text-2xl font-black' : 'text-lg md:text-xl font-bold'} text-foreground`}>
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base mb-4">
                    {card.description}
                  </p>

                  {/* Admin warning text */}
                  {i === 1 && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <p className="text-[10px] md:text-xs text-amber-400/90 font-semibold uppercase tracking-wider">
                        Changes affect financial records
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative z-10 space-y-3 md:space-y-4 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <card.permissionIcon className="w-3 h-3 md:w-4 md:h-4" />
                    <span className={i === 1 ? 'font-semibold' : ''}>{card.permission}</span>
                  </div>
                  <div
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base font-semibold transition-all duration-300 border ${i === 1
                        ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/10'
                      }`}
                  >
                    {i === 1 ? 'Enter Admin Console' : i === 0 ? 'View Dashboard' : 'Access Team Panel'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
