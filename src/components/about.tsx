"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h2
              id="about-heading"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              About Us
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Drift helps small-business web agencies track projects, payments,
              and partner-led domain expenses using a lightweight, 100% free
              Google Sheets backend. We focus on founder-level control, fast
              audits, and visual clarity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Sheet-backed (free)
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Founder control
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Live timelines
                </span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-lg bg-white/5 p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Project Summary
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-400">On Track</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-white">
                  <span>Client Name</span>
                  <span>Service Cost</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ABC Corp</span>
                  <span>$5,000</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-white">
                  <span>Domain Charged</span>
                  <span>Progress</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>$50</span>
                  <span>75%</span>
                </div>
              </div>
              <div className="mt-4 h-16 w-full rounded-lg bg-white/5"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
