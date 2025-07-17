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
import { Page } from "@payload-types";

const blockComponentsMap = {
  hero: Banner,
  hiddenGems: HiddenGems,
  packageCarousel: PackageCarousel,
  trustStats: TrustStats,
  whyChooseUs: WhyChooseUs,
  faq: FAQ,
  largeCard: LargeCardSection,
  partners: Partners,
  // Add more as you build them
} as const;

interface BlockRendererProps {
  blocks: NonNullable<Page["content"]>;
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const Component =
          blockComponentsMap[
            block.blockType as keyof typeof blockComponentsMap
          ];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `No component found for block type: ${block.blockType}`
            );
          }
          return null;
        }

        const { id, blockType, blockName, ...content } = block;

        return (
          <Component
            key={id || `${blockType}-${Math.random()}`}
            id={id || undefined}
            content={content as any} // Trust TypeScript here
          />
        );
      })}
    </>
  );
}
