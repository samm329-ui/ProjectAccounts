import ScrollSequence from "@/components/ScrollSequence";
import { About } from "@/components/about";
import { Motto } from "@/components/motto";
import { UpcomingProjects } from "@/components/upcoming-projects";

export default function Home() {
  return (
    <main className="bg-[#07070B]">
      <ScrollSequence />
      <div className="container mx-auto px-6">
        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          <About />
          <Motto />
          <UpcomingProjects />
        </div>
      </div>
      <div className="h-24" />
    </main>
  );
}