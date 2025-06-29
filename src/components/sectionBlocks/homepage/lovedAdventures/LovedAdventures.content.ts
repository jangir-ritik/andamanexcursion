import { Heart, Star } from "lucide-react";
import fishing from "@public/images/homepage/lovedAdventures/fishing.png";
import liveVolcano from "@public/images/homepage/lovedAdventures/liveVolcano.png";

// Define types
export type BadgeIconType = "Star" | "Heart";

export interface Adventure {
  title: string;
  badge: string;
  badgeIconType: BadgeIconType;
  description: string;
  image: any; // Using any for StaticImageData
  imageAlt: string;
  href: string;
}

export interface LovedAdventuresContent {
  title: string;
  specialWord: string;
  adventures: Adventure[];
}

export const lovedAdventuresContent: LovedAdventuresContent = {
  title: "Our most Loved Adventures",
  specialWord: "Loved Adventures",
  adventures: [
    {
      title: "Fishing",
      badge: "Most Viewed",
      badgeIconType: "Star",
      description:
        "Set sail with local fishermen and experience the thrill of fishing as the sun rises over crystal-clear waters.",
      image: fishing,
      imageAlt: "Fishing",
      href: "/adventures/fishing",
    },
    {
      title: "Live Volcano",
      badge: "Customer's Favourite",
      badgeIconType: "Heart",
      description:
        "Experience the raw power of nature as you witness the volcanic activity up close.",
      image: liveVolcano,
      imageAlt: "Live Volcano",
      href: "/adventures/volcano",
    },
  ],
};
