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
      <DialogContent className="max-w-4xl bg-black/50 backdrop-blur-2xl border-white/[0.1] text-foreground p-8 sm:p-12 rounded-2xl">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-2xl sm:text-3xl font-bold">
            Website Freelancing — Control Panel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Select how you want to access this project
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {panelCards.map((card, i) => (
            <Link href={card.href} passHref key={card.title}>
              <motion.div
                className="group relative flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.04] p-6 h-full transition-all duration-300 ease-in-out cursor-pointer overflow-hidden"
                whileHover={{ y: -8 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6B5DF9]/0 via-[#9F6FFF]/0 to-[#5CE7F4]/0 group-hover:from-[#6B5DF9]/10 group-hover:via-[#9F6FFF]/10 group-hover:to-[#5CE7F4]/10 transition-all duration-300"></div>
                 <div className="absolute -inset-px rounded-xl border border-transparent group-hover:border-white/20 transition-all duration-300"></div>


                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <card.icon className="w-8 h-8 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <card.permissionIcon className="w-3 h-3" />
                    <span>{card.permission}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors"
                  >
                    Open
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
