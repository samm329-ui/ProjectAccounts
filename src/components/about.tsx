"use client";
import { motion } from "framer-motion";
import { Check, LineChart } from "lucide-react";

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
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              About Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Drift helps small-business web agencies track projects, payments,
              and partner-led domain expenses using a lightweight, 100% free
              Google Sheets backend. We focus on founder-level control, fast
              audits, and visual clarity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-foreground">
                  Sheet-backed (free)
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-foreground">
                  Founder control
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-foreground">
                  Live timelines
                </span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6B5DF9] to-[#5CE7F4] rounded-2xl opacity-0 group-hover:opacity-75 transition duration-500 blur"></div>
            <div className="relative rounded-2xl bg-white/5 p-8 border border-white/10 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Project Summary
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">On Track</span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span className="text-sm">Client Name</span>
                  <span className="text-sm">ABC Corp</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="text-sm">Service Cost</span>
                  <span className="text-sm font-medium text-foreground">$5,000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="text-sm">Domain Charged</span>
                  <span className="text-sm font-medium text-foreground">$50</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm font-medium text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-green-400 h-1.5 rounded-full" style={{width: "75%"}}></div>
                </div>
              </div>
               <LineChart className="absolute bottom-4 right-4 w-16 h-16 text-white/5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
