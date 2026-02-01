import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ControlPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07070B] custom-bg text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/phases/0" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} />
            Back to Phase 0
        </Link>
        {children}
      </div>
    </div>
  );
}
