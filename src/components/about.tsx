"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, History, TrendingUp, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";

const chartData = [
  { name: "Income", value: 1850000, color: "#10B981" }, // Emerald-500
  { name: "Expenses", value: 450000, color: "#F59E0B" }, // Amber-500
  { name: "Liabilities", value: 200000, color: "#8B5CF6" }, // Violet-500
];

const totalBalance = chartData.reduce((acc, curr) => acc + curr.value, 0);

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative py-24 md:py-32 overflow-hidden w-full max-w-[100vw] overflow-x-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[160px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 w-full">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center w-full">

          {/* LEFT: Text Content - Authority & Clarity */}
          <div className="flex flex-col space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-violet-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400/80">
                Institutional Accountability
              </p>
            </div>

            <h2
              id="about-heading"
              className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1]"
            >
              Clarity and accountability <br />
              <span className="text-white/40">for serious businesses.</span>
            </h2>

            <p className="text-lg md:text-xl text-white/50 max-w-xl font-medium leading-relaxed">
              Our financial engine provides an immutable trail of every transaction.
              <span className="text-white/80"> Every Rupee Tracked. Always Audit-Ready.</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {[
                { icon: ShieldCheck, text: "Audit-Grade Records", desc: "Timestamped & logged" },
                { icon: History, text: "Immutable Trail", desc: "Every cost change tracked" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <item.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/90">{item.text}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              {[
                "Project-wise financial velocity tracking",
                "Clear separation of service margins & domain costs",
                "Strict team-ledger expense oversight"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-violet-400" />
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual Dashboard Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative lg:pl-12"
          >
            {/* Chart Card */}
            <div
              className="relative rounded-[2.5rem] bg-[#0A0A0F]/80 border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl p-8 md:p-12 w-full"
              style={{ width: '561.6px', left: '-57px', top: '7px' }}
            >

              <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                {/* Donut Chart Container */}
                <div className="relative w-full max-w-[280px] h-[280px] flex-shrink-0 mx-auto md:mx-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={85}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0F0F13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Balance</span>
                    <span className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                      ₹{totalBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Legend & Summary */}
                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Live Distribution</h3>
                    <div className="space-y-4">
                      {chartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-white/90 tabular-nums">
                            ₹{item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 border border-emerald-400/20 px-3 py-1.5 rounded-lg w-fit">
                      <TrendingUp className="w-3 h-3" />
                      Efficiency Goal: +12% YoY
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Sub-Grid */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] space-y-4 group hover:bg-white/[0.05] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Investment ROI</span>
                    <AlertCircle className="w-3.5 h-3.5 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white">₹1,203,840</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Yield: 14.2%</p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] space-y-4 group hover:bg-white/[0.05] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Cement Bal</span>
                    <History className="w-3.5 h-3.5 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-white">₹450,000</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest italic">Pending Audit</p>
                  </div>
                </div>
              </div>

              {/* Micro Trust Text */}
              <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">All values are logged and timestamped</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

