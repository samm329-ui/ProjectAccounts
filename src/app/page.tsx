import ScrollSequence from "@/components/ScrollSequence";

export default function Home() {
  return (
    <main>
      <ScrollSequence />
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white/60">Content After Hero</h2>
          <p className="mt-4 text-white/40">The scroll animation is complete.</p>
        </div>
      </div>
    </main>
  );
}
