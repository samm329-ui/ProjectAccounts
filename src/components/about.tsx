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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              About The System
            </p>
            <h2
              id="about-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Built for clarity in money, projects, and accountability.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              This system is an internal accounting and operations dashboard
              designed to give founders complete visibility over projects,
              payments, and team-led expenses. It replaces scattered
              spreadsheets with a single, structured view—without introducing
              complex accounting software or paid tools.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Every transaction, cost change, and payment timeline is tracked
              with intent. The focus is not automation for the sake of it, but
              control, auditability, and decision clarity—especially in early
              and growing businesses.
            </p>
            <ul className="mt-8 space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-1 shrink-0 text-primary" />
                <span>
                  Project-wise financial tracking with payment timelines
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-1 shrink-0 text-primary" />
                <span>
                  Clear separation between service value, domain cost, and
                  margins
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 mt-1 shrink-0 text-primary" />
                <span>Team expense logging with founder-level oversight</span>
              </li>
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-25 transition duration-500 blur-xl"></div>
            <div className="relative rounded-2xl bg-white/5 p-6 border border-white/10 shadow-2xl backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Project Summary
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">In Progress</span>
                   <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
                </div>
              </div>
               <LineChart className="w-full h-16 text-white/5 my-4" />
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Client Name</span>
                  <span className="font-medium text-foreground">Innovate Inc.</span>
                </div>
                 <div className="w-full h-px bg-white/10"></div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Service Cost</span>
                  <span className="font-medium text-foreground">$8,000</span>
                </div>
                 <div className="w-full h-px bg-white/10"></div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Domain Charged</span>
                  <span className="font-medium text-foreground">$75</span>
                </div>
                 <div className="w-full h-px bg-white/10"></div>
                 <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Extra Features</span>
                  <span className="font-medium text-foreground">$1,200</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
