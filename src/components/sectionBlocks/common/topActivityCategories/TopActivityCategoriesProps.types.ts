import { BaseSectionProps } from "@/components/sectionBlocks/homepage/topAdventures/TopAdventures.types";
import { Activity } from "@payload-types";

export interface TopActivityCategoriesProps extends BaseSectionProps {
  content: TopActivityCategoryContent;
}

export interface TopActivityCategoryContent {
  title: string;
  specialWord: string;
  description: string;
  activities: Activity[];
}