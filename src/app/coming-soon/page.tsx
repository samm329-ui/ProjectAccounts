'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#07070B] custom-bg text-foreground p-4 sm:p-8"
        >
            <div className="mx-auto max-w-4xl">
                 <Link href="/#upcoming-projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
                <div className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 sm:p-8 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold capitalize mb-4">Coming Soon</h1>
                        <p className="text-muted-foreground">This feature is under development. Check back later!</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
