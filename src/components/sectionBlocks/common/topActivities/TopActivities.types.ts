import { BaseSectionProps } from "@/components/sectionBlocks/homepage/topAdventures/TopAdventures.types";
import { Activity } from "@payload-types";

export interface TopActivitiesProps extends BaseSectionProps {
  content: TopActivitiesContent;
}

export interface TopActivitiesContent {
  title: string;
  specialWord: string;
  description: string;
  activities: Activity[];
}