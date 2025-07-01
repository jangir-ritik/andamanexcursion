import { PackageOption, PeriodOption } from "@/types/components/molecules";
import { FAQContent } from "@/types/components/sectionBlocks";

export const packageOptions: PackageOption[] = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "family", label: "Family" },
  { id: "adventure", label: "Adventure" },
  { id: "beach", label: "Beach" },
];

export const periodOptions: PeriodOption[] = [
  { id: "3-2", label: "3 Days & 2 Nights" },
  { id: "4-3", label: "4 Days & 3 Nights" },
  { id: "5-4", label: "5 Days & 4 Nights" },
  { id: "7-6", label: "7 Days & 6 Nights" },
];

export const packageCategoriesContent = [
  {
    id: "honeymoon-retreat",
    title: "Honeymoon Retreat",
    description:
      "Tailored for newlyweds, this package offers a romantic getaway to the serene beaches of Havelock and Neil Islands. It includes luxurious accommodations, candlelit dinners, and 10+ activities.",
    images: [
      {
        src: "/images/packages/honeymoonRetreat/honeymoonRetreat1.png",
        alt: "Honeymoon Retreat Package",
      },
      {
        src: "/images/packages/honeymoonRetreat/honeymoonRetreat2.png",
        alt: "Honeymoon Retreat Package",
      },
      {
        src: "/images/packages/honeymoonRetreat/honeymoonRetreat3.png",
        alt: "Honeymoon Retreat Package",
      },
    ],
    href: "/packages/honeymoon-retreat",
  },
  {
    id: "best-sellers",
    title: "Best Sellers",
    description:
      "This popular package covers the must-visit destinations in the Andaman Islands, including Port Blair, Havelock, and Neil Island. It offers a balanced mix of sightseeing, adventure activities, and relaxation, making it ideal for first-time visitors.",
    images: [
      {
        src: "/images/packages/ourBestSellers/bestSellers1.png",
        alt: "Best Sellers Package",
      },
      {
        src: "/images/packages/ourBestSellers/bestSellers2.png",
        alt: "Best Sellers Package",
      },
      {
        src: "/images/packages/ourBestSellers/bestSellers3.png",
        alt: "Best Sellers Package",
      },
    ],
    href: "/packages/best-sellers",
  },
  {
    id: "family-tours",
    title: "Family Tours",
    description:
      "Designed for families, this package ensures a fun-filled vacation with visits to kid-friendly beaches, historical sites, and engaging activities like glass-bottom boat rides.",
    images: [
      {
        src: "/images/packages/familyTour/familyTour1.png",
        alt: "Family Tours Package",
      },
      {
        src: "/images/packages/familyTour/familyTour2.png",
        alt: "Family Tours Package",
      },
      {
        src: "/images/packages/familyTour/familyTour3.png",
        alt: "Family Tours Package",
      },
    ],
    href: "/packages/family-tours",
  },
];

export const packagesPageFAQContent: FAQContent = {
  title: "Get Answers to all Your Questions!",
  specialWord: "Answers",
  items: [
    {
      question: "What kind of packages do you offer for Andaman?",
      answer:
        "We offer a variety of packages including Honeymoon Retreats, Family Tours, Adventure Packages, and Best Sellers that cover the most popular destinations. All our packages can be customized to meet your specific preferences and requirements.",
    },
    {
      question: "Are your packages all-inclusive?",
      answer:
        "Our packages typically include accommodation, transfers, selected meals, and mentioned activities. Some packages include airfare as well. We clearly mention what's included and what's not in each package description.",
    },
    {
      question: "Can I customize the duration of my stay?",
      answer:
        "Yes, we offer flexible duration options ranging from 3 days & 2 nights to 7 days & 6 nights. We can also create custom itineraries for longer stays.",
    },
    {
      question: "What's the best package for first-time visitors?",
      answer:
        "Our Best Sellers package is ideal for first-time visitors as it covers the must-visit destinations including Port Blair, Havelock, and Neil Island with a balanced mix of sightseeing and activities.",
    },
    {
      question: "Do you offer special packages for honeymoon couples?",
      answer:
        "Yes, our Honeymoon Retreat package is specifically designed for newlyweds with romantic experiences like luxury accommodations, candlelit dinners, and private beach time.",
    },
  ],
  faqs: [
    {
      question: "What kind of packages do you offer for Andaman?",
      answer:
        "We offer a variety of packages including Honeymoon Retreats, Family Tours, Adventure Packages, and Best Sellers that cover the most popular destinations. All our packages can be customized to meet your specific preferences and requirements.",
    },
    {
      question: "Are your packages all-inclusive?",
      answer:
        "Our packages typically include accommodation, transfers, selected meals, and mentioned activities. Some packages include airfare as well. We clearly mention what's included and what's not in each package description.",
    },
    {
      question: "Can I customize the duration of my stay?",
      answer:
        "Yes, we offer flexible duration options ranging from 3 days & 2 nights to 7 days & 6 nights. We can also create custom itineraries for longer stays.",
    },
    {
      question: "What's the best package for first-time visitors?",
      answer:
        "Our Best Sellers package is ideal for first-time visitors as it covers the must-visit destinations including Port Blair, Havelock, and Neil Island with a balanced mix of sightseeing and activities.",
    },
    {
      question: "Do you offer special packages for honeymoon couples?",
      answer:
        "Yes, our Honeymoon Retreat package is specifically designed for newlyweds with romantic experiences like luxury accommodations, candlelit dinners, and private beach time.",
    },
  ],
};
