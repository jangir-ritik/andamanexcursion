import heroImage from "@public/images/live-volcanos/heroBanner.png";
import fishingImage from "@public/images/live-volcanos/fishing.png";

export const content = {
  hero: {
    description:
      "See smoke rise, feel the thrill, and witness raw nature in action.",
  },
  banner: {
    image: heroImage.src,
    imageAlt: "Live Volcanos Banner",
  },
  title: {
    text: "Witness India's only",
    specialWord: "Active Volcano",
  },
  description: {
    text: "See smoke rise, feel the thrill, and witness raw nature in action.",
  },
  feature: {
    title: "Explore the Lava Trail!",
    specialWord: "Lava Trail!",
    description:
      "Scenic boat rides, volcanic plume sightings, and expert-guided narration to Barren Island.Set off from Port Blair and witness the power of nature with top-notch safety, guides, and convenience.",
    image: heroImage.src,
    imageAlt: "Live Volcanos Banner",
    ctaText: "Enquire",
    ctaHref: "/contact",
  },
  faq: {
    title: "Get Answers to all your Questions!",
    specialWord: "Answers",
    items: [
      {
        question: "What is the best time to visit the volcano?",
        answer: "The best time to visit the volcano is during the day.",
      },
    ],
  },
  largeCardSection: {
    subtitle: "Fishing",
    title: "Cast a Line, Catch a Memory!",
    ctaText: "View Details",
    ctaHref: "/fishing",
    image: fishingImage.src,
    imageAlt: "Fishing",
  },
  trivia: {
    title: "Did You Know?",
    text: "Andaman's Barren Island hosts India's only Active Volcano, quietly erupting since 1991.",
    highlightedPhrases: ["Active Volcano", "1991."],
  },
};
