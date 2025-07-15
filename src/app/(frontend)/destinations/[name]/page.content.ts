import heroImage from "@public/images/destinations/heroImage.png";
import jollyBuoy from "@public/images/destinations/jollyBuoyLargeCard.png";
import cab from "@public/icons/misc/cab.svg";
import boatSail from "@public/icons/misc/boatSail.svg";
import approved from "@public/icons/misc/approved.svg";

export const content = {
  hero: {
    description:
      "Vivid corals, rich marine life, and untouched natural beauty, Jolly Buoy is a hidden gem in the Mahatma Gandhi Marine Park.",
  },
  banner: {
    image: heroImage.src,
    imageAlt: "Jolly Buoy Island Banner",
  },
  feature: {
    title: "Where Black Rocks Meet White Sands!",
    specialWord: "White Sands!",
    description:
      "Kalapathar Beach stands out for its dark rocks and tsunami-uprooted trees, creating a striking contrast against soft, white sands. A raw, untouched beauty.",
    image: heroImage.src,
    imageAlt: "Kalapathar Beach",
    ctaText: "Enquire",
    ctaHref: "/contact",
  },
  howToReach: {
    title: "How to Reach?",
    specialWord: "Reach?",
    cards: [
      {
        title: "From Port Blair",
        description:
          "Hire a cab or bus to reach Wandoor Beach, is 30 km away and takes an hour to reach.",
        icon: cab.src,
      },
      {
        title: "Jolly Buoy Island by Boat",
        description:
          " This boat ride to the island takes almost 40 minutes. Departure times are around 8 AM to 9 AM, reach the jetty by 8 AM.",
        icon: boatSail.src,
      },
      {
        title: "Permits",
        description:
          "Pre-book permits a day in advance at the Port Blair Tourism Office. Carry a valid photo ID.",
        icon: approved.src,
      },
    ],
  },
  explore: {
    title: "Things to Explore!",
    specialWord: "Explore!",
    description:
      "Island hop, dive deep, or cruise smooth plan, your perfect Andaman escape.",
    activities: [
      {
        subtitle: "Coral Reefs & Marine Life",
        title: "Witness vibrant coral reefs through a glass-bottom boat.",
        image:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
        imageAlt: "Coral reefs and marine life",
      },
      {
        subtitle: "Snorkeling Adventure",
        title: "Dive into crystal clear waters and explore underwater wonders.",
        image:
          "https://images.unsplash.com/photo-1562155955-1cb2d73488d7?w=800&q=80",
        imageAlt: "Snorkeling in clear waters",
      },
      {
        subtitle: "Beach Trekking",
        title: "Discover hidden trails and pristine beaches.",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        imageAlt: "Beach trekking trails",
      },
      {
        subtitle: "Nature Photography",
        title: "Capture untouched natural beauty and wildlife.",
        image:
          "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
        imageAlt: "Nature photography",
      },
    ],
  },
  trivia: {
    title: "Did you know?",
    text: "Jolly Buoy is a No Plastic Island known for untouched coral reefs & eco-friendly snorkelling. It's a paradise for nature lovers and underwater explorers.",
    highlightedPhrases: [
      "No Plastic Island",
      "eco-friendly snorkelling",
      "paradise for nature lovers",
    ],
  },
  largeCardSection: {
    subtitle: "Rock Formation and Marine Life",
    title: "Walk the Reef, Witness Nature's Artistry",
    image: jollyBuoy.src,
    imageAlt: "Jolly Buoy Island",
    ctaText: "View Details",
    ctaHref: "/activities/sea-walking",
  },
};
