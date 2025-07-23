import { ExperienceSection } from "@/app/(frontend)/fishing/components/ExperienceSection";
import { VisualCategoryGrid } from "@/components/sectionBlocks/common";
import {
  FAQ,
  Testimonials,
  Partners,
  LargeCardSection,
  SecondaryBanner,
  Trivia,
} from "@/components/sectionBlocks/common";
import { ServiceTeaser } from "@/components/sectionBlocks/common/serviceTeaser/ServiceTeaser";
import TopActivities from "@/components/sectionBlocks/common/topActivities/TopActivities";
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
  secondaryBanner: SecondaryBanner,
  hiddenGems: HiddenGems,
  packageCarousel: PackageCarousel,
  trustStats: TrustStats,
  whyChooseUs: WhyChooseUs,
  faq: FAQ,
  largeCard: LargeCardSection,
  partners: Partners,
  story: Story,
  topActivities: TopActivities,
  topAdventures: TopAdventures,
  testimonials: Testimonials,
  // Add more block types as needed
  serviceTeaser: ServiceTeaser,
  trivia: Trivia,
  experience: ExperienceSection,
  howToReach: null, // Add component when available
  visualCategoryGrid: VisualCategoryGrid, // Add component when available
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
