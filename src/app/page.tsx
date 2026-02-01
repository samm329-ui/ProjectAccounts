import ScrollSequence from "@/components/ScrollSequence";
import { About } from "@/components/about";
import { Motto } from "@/components/motto";
import { UpcomingProjects } from "@/components/upcoming-projects";

export default function Home() {
  return (
    <main className="bg-[#07070B] custom-bg">
      <ScrollSequence />
      <div className="mx-auto max-w-6xl px-6">
        <div className="space-y-16 md:space-y-24 lg:space-y-32 py-16 md:py-24 lg:py-32">
          <About />
          <Motto />
          <UpcomingProjects />
        </div>
      </div>
    </main>
  );
}
