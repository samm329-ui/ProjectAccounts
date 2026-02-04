import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { phases } from "@/lib/phases";

export default function MobileRoadmap() {
    return (
        <div className="w-full px-6 pb-20">
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
                    <div className="h-[1px] w-8 bg-white/40" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">I SAW SENT ACCOUNTS.COM</span>
                    <div className="h-[1px] w-8 bg-white/40" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Institutional Roadmap</h2>
                <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                    A disciplined, step-by-step growth path for institutions to achieve their financial goals based by Phases.
                </p>
            </div>

            <div className="space-y-3">
                {phases.map((item, index) => (
                    <Link
                        href={`/phases/${item.phase}`}
                        key={index}
                    >
                        <div
                            className="group relative overflow-hidden rounded-2xl bg-[#14121E]/60 backdrop-blur-xl border border-white/5 p-5 transition-all active:scale-[0.98]"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Phase {item.phase}</h3>
                                    <p className="text-xs text-white/60">{item.title}</p>
                                </div>
                                <ChevronRight className="text-white/30" size={20} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
