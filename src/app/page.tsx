import {
  FAQ,
  Testimonials,
  Partners,
  LargeCardSection,
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

import { content } from "./page.content";

export default function Home() {
  return (
    <>
      <Banner content={content.banner} />
      <Packages />
      <PackageCarousel />
      <TrustStats />
      <HiddenGems content={content.hiddenGems} />
      <LovedAdventures />
      <Partners content={content.partners} />
      <LargeCardSection content={content.largeCardSection} />
      <WhyChooseUs />
      <Story />
      <Testimonials content={content.testimonials} />
      <FAQ content={content.faqSection} />
      <LargeCardSection content={content.largeCardSection2} />
    </>
  );
}
