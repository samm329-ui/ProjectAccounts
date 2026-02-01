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
          transition={{ duration: 0.5 }}
          className="rounded-lg bg-white/5 p-8 text-center shadow-2xl"
        >
          <h2
            id="motto-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Our Motto
          </h2>
          <p className="mt-4 text-xl font-semibold text-white">
            Build with clarity. Charge with fairness. Control with confidence.
          </p>
          <p className="mt-2 text-lg text-gray-400">
            We give you a simple, auditable system so you never lose track of a
            rupee or a promise.
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-105"
            >
              See Demo →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
