import Image from "next/image";
import { Menu } from "lucide-react";

export default function MobileHero() {
    return (
        <div className="relative w-full min-h-[100dvh] flex flex-col bg-[#07070B] text-white overflow-hidden pb-10">

            {/* Top Navigation (Mobile) */}
            <nav className="flex items-center justify-between px-6 pt-6 pb-2 relative z-50">
                <span className="text-lg font-bold tracking-tight text-white">ProjectAccounts</span>
                <button className="p-2 -mr-2 text-white/80">
                    <Menu size={24} />
                </button>
            </nav>

            {/* Main Hero Content */}
            <div className="flex-1 flex flex-col items-center pt-8 relative z-10 w-full max-w-md mx-auto">

                {/* Title Section */}
                <div className="px-8 text-center mb-8">
                    <h1 className="text-[32px] leading-[1.1] font-bold text-white mb-4 tracking-tight">
                        Transparent<br />
                        Financial<br />
                        Records
                    </h1>
                    <p className="text-sm text-white/60 leading-relaxed max-w-[280px] mx-auto">
                        Open records, secure updates, ensuring ethical financial integrity.
                    </p>
                </div>

                {/* Ashoka Lion Image - Centered & Dramatic */}
                <div className="relative w-full h-[45vh] mt-[-20px] mb-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#07070B] via-transparent to-transparent z-10" />
                    <Image
                        src="https://olcukmvtctbvutjcrmph.supabase.co/storage/v1/object/public/assest/hero%20animation/accounts%20png/Sequence%2001_1000.png"
                        alt="Ashoka Lion Statue"
                        fill
                        className="object-contain object-center scale-110 opacity-90 mix-blend-lighten"
                        priority
                        quality={100}
                        sizes="100vw"
                    />
                </div>

                {/* Transition Statement */}
                <div className="text-center px-6 relative z-20 mt-auto pb-4">
                    <p className="text-white/80 text-lg font-medium tracking-wide">
                        Clarity and accountability<br />
                        for serious businesses.
                    </p>
                </div>

            </div>

            {/* Background Noise/Vignette */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#07070B]/50 to-[#07070B] pointer-events-none" />
        </div>
    );
}
