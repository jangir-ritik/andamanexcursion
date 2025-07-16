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

const blockComponentsMap = {
  hero: Banner,
  hiddenGems: HiddenGems,
  lovedAdventures: LovedAdventures,
  packageCarousel: PackageCarousel,
  packages: Packages,
  story: Story,
  trustStats: TrustStats,
  partners: Partners,
  whyChooseUs: WhyChooseUs,
  testimonials: Testimonials,
  faqSection: FAQ,
  largeCardSection: LargeCardSection,
};

interface BlockRendererProps {
  blocks: Array<{
    blockType: keyof typeof blockComponentsMap;
    id: string;
    [key: string]: any;
  }>;
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockComponentsMap[block.blockType];

        if (!Component) {
          console.warn(`Unknown block type: ${block.blockType}`);
          return null;
        }
        return <Component key={block.id} content={block} />;
      })}
    </>
  );
}
