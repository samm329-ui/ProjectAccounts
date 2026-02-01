'use client';
import Lanyard from "@/components/Lanyard";
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
            className="relative min-h-screen bg-[#07070B] text-foreground"
        >
            <div className="absolute top-0 left-0 w-full h-full">
                <Lanyard />
            </div>
            <div className="relative z-10 p-4 sm:p-8">
                 <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>
                <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold">Coming Soon</h1>
                    <p className="mt-4 text-lg text-muted-foreground">This feature is under development. Check back later!</p>
                </div>
            </div>
        </motion.div>
    )
}
