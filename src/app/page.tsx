import { Packages } from "@/components/sectionBlocks/homepage/packages/Packages";
import { Banner } from "@/components/sectionBlocks/homepage/banner/Banner";
import PackageCarousel from "@/components/sectionBlocks/homepage/packageCarousel/PackageCarousel";
import { TrustStats } from "@/components/sectionBlocks/homepage/trustStats";
import HiddenGems from "@/components/sectionBlocks/homepage/hiddenGems/HiddenGems";
import { LovedAdventures } from "@/components/sectionBlocks/homepage/lovedAdventures";
import Partners from "@/components/sectionBlocks/homepage/partners/Partners";
import ScubaDiving from "@/components/sectionBlocks/homepage/scubaDivingCTA/ScubaDiving";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Banner />
      <Packages />
      <PackageCarousel />
      <TrustStats />
      <HiddenGems />
      <LovedAdventures />
      <Partners />
      <ScubaDiving />
    </>
  );
}
