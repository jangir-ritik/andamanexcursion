import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface LovedAdventuresProps extends BaseSectionProps {}

export type BadgeIconType = "Star" | "Heart" | "Trophy" | "New";

export interface Adventure {
  title: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
  badge?: string;
  badgeIconType?: BadgeIconType;
  href: string;
}

export interface LovedAdventuresContent {
  title: string;
  specialWord: string;
  adventures: Adventure[];
}
