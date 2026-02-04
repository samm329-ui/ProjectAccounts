"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";

const data = [
    { name: "Paid", value: 1000000, color: "#10B981" }, // Emerald
    { name: "Pending", value: 500000, color: "#3B82F6" }, // Blue
    { name: "Overdue", value: 200000, color: "#EF4444" }, // Red
    { name: "Empty", value: 800000, color: "#333333" }, // Grey filler for visual balance if needed, or just partial
];

// Adjusting data to match the visual "half circle" or "full circle" look. 
// Reference shows a full donut. 
// Let's assume standard distribution for now based on the image's vibrant colors.
// Paid (Green), Pending (Blue/Teal), Overdue (Red/Orange).
// The reference image has Green, Teal, and a small Red sliver.

const chartData = [
    { name: 'Paid', value: 65, color: '#34D399' },    // Bright Green
    { name: 'Pending', value: 25, color: '#2DD4BF' }, // Teal
    { name: 'Overdue', value: 10, color: '#F87171' }, // Red
];

export default function MobileClarityCard() {
    return (
        <div className="w-full px-4 mb-8">
            <div className="relative w-full overflow-hidden rounded-[32px] bg-[#1a1726]/60 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl">
                {/* Purple Glow Effect */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#7C6CFF]/30 rounded-full blur-[60px]" />
                <div className="absolute top-1/2 right-0 w-32 h-32 bg-[#3FE0C5]/10 rounded-full blur-[50px]" />

                <div className="relative z-10 grid grid-cols-2 gap-4">

                    {/* Left Content */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-white mb-2">
                                Clarity and <br />
                                <span className="text-white/70">accountability</span> <br />
                                for serious <br />
                                <span className="text-white/70">businesses.</span>
                            </h2>
                            <p className="text-[10px] text-white/50 leading-relaxed">
                                Our financial tools give ceos a verifiable record of every transaction—empowering them to charge fairly, spend wisely, and invest with confidence.
                            </p>
                        </div>
                    </div>

                    {/* Right Chart */}
                    <div className="flex flex-col items-center justify-center relative">
                        <div className="w-[140px] h-[140px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={55}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Inner Text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">₹2,500,000</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                                <span className="text-[8px] text-white/60">Paid <span className="text-white">₹ 1,000,000</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                                <span className="text-[8px] text-white/60">Pending <span className="text-white">₹ 500,000</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
                                <span className="text-[8px] text-white/60">Overdue <span className="text-white">₹ 200,000</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
