import { Packages } from "@/components/sectionBlocks/homepage/packages/Packages";
import { Banner } from "@/components/sectionBlocks/homepage/banner/Banner";
import PackageCarousel from "@/components/sectionBlocks/homepage/packageCarousel/PackageCarousel";
import { TrustStats } from "@/components/sectionBlocks/homepage/trustStats";
import HiddenGems from "@/components/sectionBlocks/homepage/hiddenGems/HiddenGems";
import { LovedAdventures } from "@/components/sectionBlocks/homepage/lovedAdventures";
import Partners from "@/components/sectionBlocks/homepage/partners/Partners";

import WhyChooseUs from "@/components/sectionBlocks/homepage/whyChooseUs/WhyChooseUs";
import Story from "@/components/sectionBlocks/homepage/story/Story";
import ScubaDiving from "@/components/sectionBlocks/common/scubaDiving/ScubaDiving";
import AndamanCalling from "@/components/sectionBlocks/common/andamanCalling/AndamanCalling";
import Testimonials from "@/components/sectionBlocks/common/testimonials/Testimonials";
import { faqContent } from "@/components/sectionBlocks/homepage/faq/FAQ.content";
import FAQ from "@/components/sectionBlocks/common/faq/FAQ";

export default function Home() {
  return (
    <>
      <Banner />
      <Packages />
      <PackageCarousel />
      <TrustStats />
      <HiddenGems />
      <LovedAdventures />
      <Partners />
      <ScubaDiving />
      <WhyChooseUs />
      <Story />
      <Testimonials />
      <FAQ {...faqContent} />
      <AndamanCalling />
    </>
  );
}
