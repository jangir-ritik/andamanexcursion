import { AndamanCalling } from "@/components/sectionBlocks/common/andamanCalling/AndamanCalling";
import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
import { ScubaDiving } from "@/components/sectionBlocks/common/scubaDiving/ScubaDiving";
import { Testimonials } from "@/components/sectionBlocks/common/testimonials/Testimonials";
import {
  Banner,
  HiddenGems,
  LovedAdventures,
  PackageCarousel,
  Packages,
  Partners,
  Story,
  TrustStats,
  WhyChooseUs,
} from "@/components/sectionBlocks/homepage";
import { faqContent } from "@/components/sectionBlocks/homepage/faq/FAQ.content";

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
