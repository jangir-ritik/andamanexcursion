import heroImage from "@public/images/fishing/fishingBanner.png";
import fishingImage from "@public/images/fishing/fishing.png";
import cabIcon from "@public/icons/misc/cab.svg";
import hookIcon from "@public/icons/misc/fishingHook.svg";
import boxIcon from "@public/icons/misc/box.svg";
import volcanoImage from "@public/images/fishing/volcano.png";
import fish1 from "@public/images/fishing/fishes/1.png";
import fish2 from "@public/images/fishing/fishes/2.png";
import fish3 from "@public/images/fishing/fishes/3.png";
import fish4 from "@public/images/fishing/fishes/4.png";

export const content = {
  banner: {
    image: heroImage.src,
    imageAlt: "Fishing Banner",
  },
  title: {
    text: "Fishing Experience",
    specialWord: "in Andaman",
  },
  description: {
    text: "See smoke rise, feel the thrill, and witness raw nature in action.",
  },
  feature: {
    title: "Catch the Fishing Thrill!",
    specialWord: "Fishing Thrill!",
    description:
      "Scenic boat rides, vibrant coral views, and a hands on fishing adventure await you.Set off from Port Blair with experienced local crews, try your hand at traditional and sport fishing, and have your fresh catch cleaned, packed, and iced, on request.",
    image: fishingImage.src,
    imageAlt: "Fishing Banner",
    ctaText: "Enquire",
    ctaHref: "/contact",
  },
  faq: {
    title: "Get Answers to all your Questions!",
    specialWord: "Answers",
    items: [
      {
        question: "What is the best time to visit the Andaman Islands?",
        answer:
          "The best time to visit the Andaman Islands is from October to May, when the weather is pleasant and the sea is calm.",
      },
      {
        question: "What is the best time to visit the Andaman Islands?",
        answer:
          "The best time to visit the Andaman Islands is from October to May, when the weather is pleasant and the sea is calm.",
      },
    ],
  },
  largeCardSection: {
    subtitle: "Only Live Volcano in India",
    title: "Feel the Earth Roar,Witness a Living Volcano",
    ctaText: "View Details",
    ctaHref: "/volcano",
    image: volcanoImage.src,
    imageAlt: "Volcano",
  },
  trivia: {
    title: "Did You Know?",
    text: "Andaman's Barren Island hosts India's only Active Volcano, quietly erupting since 1991.",
    highlightedPhrases: ["Active Volcano", "1991."],
  },
  experience: {
    title: "Experience that pulls more than just fishes",
    specialWord: "Experience",
    description:
      "Redefining fishing adventures with thoughtfully designed trips, scenic routes, and catchy moments.",
    cards: [
      {
        title: "Free Pickup & Drop",
        description: "Relax - transport to the jetty and back is covered.",
        icon: cabIcon.src,
      },
      {
        title: "All Gear Included",
        description: "Rods, reels, baits, ice boxes no extra charges.",
        icon: hookIcon.src,
      },
      {
        title: "Catch & Keep",
        description: "We'll clean, pack, and ice your fish (on request only).",
        icon: boxIcon.src,
      },
    ],
  },
  famousFishes: {
    title: "Famous Fishes in Andaman",
    specialWord: "Fishes",
    description: "From reef to deep sea,meet the stars of Andaman's waters.",
    fishes: [
      {
        title: "Barred Parrotfish",
        subtitle: "A vibrant parrotfish with a unique pattern.",
        image: fish1.src,
        imageAlt: "Barred Parrotfish",
      },
      {
        title: "Andaman Scad",
        subtitle: "Unique scad species with a unique pattern.",
        image: fish2.src,
        imageAlt: "Andaman Scad",
      },
      {
        title: "Red Snappers",
        subtitle: "Diverse snapper species with a unique pattern.",
        image: fish3.src,
        imageAlt: "Red Snappers",
      },
      {
        title: "Blue Marlin",
        subtitle: "A vibrant blue marlin with a unique pattern.",
        image: fish4.src,
        imageAlt: "Blue Marlin",
      },
    ],
  },
};
