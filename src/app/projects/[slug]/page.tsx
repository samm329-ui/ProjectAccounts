'use client';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-[#07070B] custom-bg text-foreground p-4 sm:p-8"
        >
            <div className="mx-auto max-w-4xl">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md p-6 sm:p-8 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold capitalize mb-4">
                            Project: {typeof slug === 'string' ? slug.replace(/-/g, ' ') : ''}
                        </h1>
                        <p className="text-muted-foreground">This is a placeholder page for the project.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
