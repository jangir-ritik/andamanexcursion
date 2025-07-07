import heroImage from "@public/images/specials/heroBanner.png";
import engagementImage from "@public/images/specials/engagement.png";
import teamIcon from "@public/icons/misc/team.svg";
import checkIcon from "@public/icons/misc/check.svg";
import flowerIcon from "@public/icons/misc/flower.svg";
import marriageImage from "@public/images/specials/marriage.png";

export const content = {
  banner: {
    image: heroImage.src,
    imageAlt: "Special Banner",
  },
  title: {
    text: "Engaged by the Ocean,",
    specialWord: "Etched for a Lifetime",
  },
  feature: {
    title: "Your Dream Engagement!",
    specialWord: "Engagement!",
    description:
      "A quiet and lovely escape for your engagement right into the heart of the stunning Andaman Islands: With its charming sugary beaches, turquoise waters, and pristine feel, the Andaman Islands make for a memorable setting for engagement.",
    image: engagementImage.src,
    imageAlt: "Engagement Banner",
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
    subtitle: "Wedding at Andaman",
    title: "Celebrate Love Where, Sea Meets the Sky",
    ctaText: "View Details",
    ctaHref: "/packages/wedding",
    image: marriageImage.src,
    imageAlt: "Marriage Banner",
  },
  experience: {
    title: "Planning your big day just got breezier",
    specialWord: "Breezier",
    description:
      "Redefining destination engagements with thoughtfully planned details, expert tips, and memorable moments.",
    cards: [
      {
        title: "Guest Size",
        description: "20-60 guests is equal to smooth travel & easy planning.",
        icon: teamIcon.src,
      },
      {
        title: "Go Local",
        description: "Floral, catering, makeup all local vendors add charm.",
        icon: checkIcon.src,
      },
      {
        title: "Book In Advance",
        description: "Reserve venue & stay 3-4 months in advance.",
        icon: flowerIcon.src,
      },
    ],
  },
};
