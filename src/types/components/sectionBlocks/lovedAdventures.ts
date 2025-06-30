export interface LovedAdventureItem {
  title: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
  badge: string;
  badgeIconType: BadgeIconType;
  href: string;
}

export type BadgeIconType = "Star" | "Heart" | "None";

export interface LovedAdventuresContent {
  title: string;
  specialWord: string;
  adventures: LovedAdventureItem[];
}

export interface LovedAdventuresProps {
  className?: string;
}
