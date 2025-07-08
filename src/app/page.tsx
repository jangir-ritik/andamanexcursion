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
      <Packages content={content.packages} />
      <PackageCarousel content={content.packageCarousel} />
      <TrustStats content={content.trustStats} />
      <HiddenGems content={content.hiddenGems} />
      <LovedAdventures />
      <Partners content={content.partners} />
      <LargeCardSection content={content.largeCardSection} />
      <WhyChooseUs content={content.whyChooseUs} />
      <Story content={content.story} />
      <Testimonials content={content.testimonials} />
      <FAQ content={content.faqSection} />
      <LargeCardSection content={content.largeCardSection2} />
    </>
  );
}
