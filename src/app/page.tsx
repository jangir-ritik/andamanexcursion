import {
  AndamanCalling,
  FAQ,
  ScubaDiving,
  Testimonials,
  Partners,
} from "@/components/sectionBlocks/common";
import {
  Banner,
  HiddenGems,
  LovedAdventures,
  PackageCarousel,
  Packages,
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
