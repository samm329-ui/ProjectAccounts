"use client";
import { motion } from "framer-motion";
import { Check, LineChart } from "lucide-react";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-24 lg:grid-cols-2 lg:items-start lg:gap-32">

          {/* Text Content: Accountability Beat */}
          <div className="flex flex-col pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#6B5DF9]" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Core Architecture
              </p>
            </div>

            <h2
              id="about-heading"
              className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-8"
            >
              Built for precision in <br />
              <span className="text-white/40 font-serif italic text-3xl md:text-4xl">projects & accountability.</span>
            </h2>

            <div className="space-y-6 text-lg text-white/50 max-w-xl">
              <p>
                This system is an internal accounting and operations dashboard
                designed to give founders complete visibility over projects,
                payments, and team-led expenses.
              </p>
              <p className="text-sm font-medium leading-relaxed italic border-l border-white/10 pl-6">
                "Every transaction, cost change, and payment timeline is tracked
                with intent. The focus is not automation for the sake of it, but
                control, auditability, and decision clarity."
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6">
              {[
                "Project-wise financial tracking with payment timelines",
                "Clear separation between service value, domain cost, and margins",
                "Team expense logging with founder-level oversight"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-1 rounded-full bg-white/5 border border-white/10">
                    <Check className="h-3 w-3 text-[#6B5DF9]" />
                  </div>
                  <span className="text-sm font-bold text-white/60 tracking-tight uppercase">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Content: The Proof of Work */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-20 bg-purple-600/5 blur-[120px] rounded-full opacity-50" />

            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative rounded-2xl bg-[#0F0F13]/60 p-8 border border-white/[0.05] shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.03]">
                  <div>
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1">
                      Live Transaction Proof
                    </h3>
                    <p className="text-lg font-bold text-white">Project ID #ACC-02</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">In Progress</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Innovate Inc.", value: "Innovate", subtitle: "Client Name" },
                    { label: "$8,000", value: "8000", subtitle: "Service Cost" },
                    { label: "$75", value: "75", subtitle: "Domain Charged" },
                    { label: "$1,200", value: "1200", subtitle: "Extra Features" }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-end group/item">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] group-hover/item:text-[#6B5DF9] transition-colors">{stat.subtitle}</span>
                        <p className="text-base font-bold text-white/90">{stat.label}</p>
                      </div>
                      <div className="h-px flex-1 mx-4 mb-2 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/[0.03]">
                  <LineChart className="w-full h-12 text-white/[0.03]" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
