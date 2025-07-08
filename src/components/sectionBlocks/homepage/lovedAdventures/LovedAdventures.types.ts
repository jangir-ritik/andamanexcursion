import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}
export interface LovedAdventuresProps extends BaseSectionProps {
  content: LovedAdventuresContent;
}

export interface LovedAdventuresContent {
  title: string;
  specialWord: string;
  adventures: Adventure[];
}

export interface Adventure {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  badge?: string;
  badgeIconType?: BadgeIconType;
  href: string;
}

export type BadgeIconType = "Star" | "Heart";
