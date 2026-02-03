"use client";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Motto() {
  return (
    <section
      id="motto"
      aria-labelledby="motto-heading"
      className="relative"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[2rem] bg-white/[0.02] p-12 md:p-24 text-center border border-white/[0.05] shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Layered Institutional Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#6B5DF9]/10 rounded-full blur-[120px]"></div>

          <div className="relative space-y-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-px bg-white/10" />
              <h2
                id="motto-heading"
                className="text-xs font-black uppercase tracking-[0.5em] text-white/30"
              >
                Operational Mandate
              </h2>
            </div>

            <p className="text-3xl md:text-5xl font-bold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
              "Build with clarity. <span className="text-white/30">Charge with fairness.</span> <br />
              Control with confidence."
            </p>

            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-medium">
              We provide a simple, auditable system ensuring <span className="text-white/60">no rupee or promise is ever lost.</span>
            </p>

            <div className="pt-8">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                  >
                    View Our Philosophy
                    <div className="w-5 h-px bg-white/20 group-hover:w-8 transition-all" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#0F0F13] border-white/10 text-white shadow-2xl backdrop-blur-3xl">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-px bg-[#6B5DF9]" />
                      <DialogTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Our Philosophy</DialogTitle>
                    </div>
                  </DialogHeader>
                  <div className="py-6 space-y-6 text-sm md:text-base leading-relaxed text-white/60 font-medium">
                    <p className="italic border-l border-[#6B5DF9] pl-6 py-2">
                      Money should never be confusing, hidden, or reactive. Every project, every payment, and every expense deserves a clear trail and a clear purpose.
                    </p>
                    <p>
                      This system exists to replace guesswork with visibility — so founders always know where money is coming from, where it is going, and why it is moving.
                    </p>
                    <p className="text-white/30">
                      Not to complicate operations, but to simplify decisions. Not to automate blindly, but to preserve control. Not to scale chaos, but to build discipline from day one.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
