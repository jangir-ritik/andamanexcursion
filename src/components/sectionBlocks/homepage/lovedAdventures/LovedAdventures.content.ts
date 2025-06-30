import {
  BadgeIconType,
  LovedAdventuresContent,
} from "@/types/components/sectionBlocks";

export type { BadgeIconType };

export const lovedAdventuresContent: LovedAdventuresContent = {
  title: "Our Most Loved Adventures",
  specialWord: "Loved Adventures",
  adventures: [
    {
      title: "Fishing",
      description:
        "Discover the thrill of deep-sea fishing in the crystal-clear waters of Andaman. Perfect for both beginners and experienced anglers.",
      image: {
        src: "/images/homepage/lovedAdventures/fishing.png",
      },
      imageAlt: "Person fishing in the deep blue waters of Andaman",
      badge: "Most Popular",
      badgeIconType: "Star",
      href: "/adventures/fishing",
    },
    {
      title: "Live Volcano",
      description:
        "Witness the natural wonder of Barren Island, home to the only active volcano in South Asia. A once-in-a-lifetime experience.",
      image: {
        src: "/images/homepage/lovedAdventures/liveVolcano.png",
      },
      imageAlt: "Active volcano on Barren Island with smoke rising",
      badge: "Customer Favorite",
      badgeIconType: "Heart",
      href: "/adventures/volcano",
    },
  ],
};
