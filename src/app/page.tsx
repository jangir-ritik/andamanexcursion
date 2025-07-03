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
      <Banner />
      <Packages />
      <PackageCarousel />
      <TrustStats />
      <HiddenGems />
      <LovedAdventures />
      <Partners />
      <LargeCardSection
        subtitle={content.largeCardSection.subtitle}
        title={content.largeCardSection.title}
        image={content.largeCardSection.image}
        imageAlt={content.largeCardSection.imageAlt}
        ctaText={content.largeCardSection.ctaText}
        ctaHref={content.largeCardSection.ctaHref}
      />
      <WhyChooseUs />
      <Story />
      <Testimonials />
      <FAQ
        title={content.faqSection.title}
        specialWord={content.faqSection.specialWord}
        items={content.faqSection.items}
      />
      <LargeCardSection
        title={content.largeCardSection2.title}
        image={content.largeCardSection2.image}
        imageAlt={content.largeCardSection2.imageAlt}
        ctaText={content.largeCardSection2.ctaText}
        ctaHref={content.largeCardSection2.ctaHref}
      />
    </>
  );
}
