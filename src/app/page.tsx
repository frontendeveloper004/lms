import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { FeaturesV2 } from "@/components/landing-v2/FeaturesV2";
import { CoursesV2 } from "@/components/landing-v2/CoursesV2";
import { TestimonialsV2 } from "@/components/landing-v2/TestimonialsV2";
import { MentorsV2 } from "@/components/landing-v2/MentorsV2";
import { CTAV2 } from "@/components/landing-v2/CTAV2";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white pb-0">
      <HeroV2 />
      <FeaturesV2 />
      <CoursesV2 />
      <TestimonialsV2 />
      <MentorsV2 />
      <CTAV2 />
    </div>
  );
}
