import {
  FAQ,
  Testimonials,
  Partners,
  LargeCardSection,
} from "@/components/sectionBlocks/common";
import {
  Banner,
  HiddenGems,
  PackageCarousel,
  Packages,
  Story,
  TopAdventures,
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
  story: Story,
  topAdventures: TopAdventures,
  testimonials: Testimonials,
  // Add more block types as needed
  feature: null, // Add component when available
  trivia: null, // Add component when available
  experience: null, // Add component when available
  howToReach: null, // Add component when available
  famousFishes: null, // Add component when available
} as const;

interface BlockRendererProps {
  blocks: NonNullable<Page["pageContent"]>["content"];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
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
            key={id || `${blockType}-${index}`} // ✅ Use index as fallback
            id={id || undefined}
            content={content as any}
          />
        );
      })}
    </>
  );
}
