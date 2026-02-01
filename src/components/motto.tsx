"use client";
import { motion } from "framer-motion";

export function Motto() {
  return (
    <section
      id="motto"
      aria-labelledby="motto-heading"
      className="py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl bg-white/5 p-8 text-center border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden"
        >
          <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 bg-gradient-to-r from-[#6B5DF9]/20 to-[#5CE7F4]/20 rounded-full blur-3xl"></div>
          <h2
            id="motto-heading"
            className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Our Motto
          </h2>
          <p className="mt-4 text-xl md:text-2xl font-medium text-foreground max-w-3xl mx-auto">
            Build with clarity. Charge with fairness. Control with confidence.
          </p>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            We give you a simple, auditable system so you never lose track of a
            rupee or a promise.
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="inline-block rounded-lg bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] px-8 py-3 text-lg font-semibold text-white shadow-[0_0_20px_rgba(159,111,255,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(159,111,255,0.6)]"
            >
              See Demo →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
