import scubaDiving from "@public/images/homepage/scubaDivingCTA/diver.png";

import {
  PackageOption,
  PeriodOption,
} from "@/components/molecules/PackageSelector/PackageSelector.types";
import { FAQContent } from "@/components/sectionBlocks/common/faq/FAQ.types";
import { Media } from "@payload-types";

export const packageOptions: PackageOption[] = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "family", label: "Family" },
  { id: "best", label: "Best Sellers" },
];

export const periodOptions: PeriodOption[] = [
  { id: "all", label: "All Durations" },
  { id: "3-2", label: "3D 2N" },
  { id: "4-3", label: "4D 3N" },
  { id: "5-4", label: "5D 4N" },
  { id: "6-5", label: "6D 5N" },
  { id: "7-6", label: "7D 6N" },
];

export interface PackageCategory {
  id: string;
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  href: string;
}

export const packageCategoriesContent: PackageCategory[] = [
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

// Map category IDs to package selector values
export const categoryToPackageMap = {
  "honeymoon-retreat": "honeymoon",
  "family-tours": "family",
  "best-sellers": "best",
};

// Map package selector values to category IDs
export const packageToCategoryMap = {
  honeymoon: "honeymoon-retreat",
  family: "family-tours",
  best: "best-sellers",
};

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
};

export const largeCardSectionContent = {
  subtitle: "Scuba Diving",
  title: "Dive Beneath Waves, Discover Hidden Worlds",
  image: scubaDiving.src,
  imageAlt: "Scuba diver exploring coral reef in the Andaman Sea",
  ctaText: "View Details",
  ctaHref: "/scuba-diving",
};

export const testimonials = {
  title: "Our Client Appreciations Keeps Us Going",
  specialWord: "Client Appreciations",
  subtitle: "All testimonials are pulled from authentic Google reviews.",
  testimonials: [
    {
      id: 1,
      text: "From start to finish, the experience was seamless. The crew was attentive, the boats were spotless, and every island we visited felt like a private paradise. Would book again in a heartbeat.",
      author: "Rohit Verma",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: -6,
    },
    {
      id: 2,
      text: "I've been on many boat tours, but this one stood out. The timing, hospitality, and hidden gems we explored made this feel like more than just a vacation—it was an adventure.",
      author: "Sneha Kulkarni",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: 3,
    },
    {
      id: 3,
      text: "Booking with Andaman Excursion was the best decision we made on our trip. Each destination was more beautiful than the last. The guides clearly love what they do.",
      author: "Vikram Nair",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: 0,
    },
    {
      id: 4,
      text: "A perfect blend of thrill and tranquility. We snorkeled, explored untouched beaches, and watched sunsets that looked straight out of a movie. Unforgettable moments throughout.",
      author: "Meera Joshi",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: 5,
    },
    {
      id: 5,
      text: "Every detail was taken care of—from pick-up to the smallest island hop. It was smooth, scenic, and simply magical. Highly recommend to anyone visiting the Andamans.",
      author: "Tanishq Mehta",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: -4,
    },
    {
      id: 6,
      text: "The crew was friendly, knowledgeable, and made sure we had the best experience. The islands were breathtaking, and the snorkeling was incredible. I'll definitely be back!",
      author: "Rajesh Kumar",
      avatar: "/images/homepage/testimonials/avatar.png" as unknown as Media,
      rotation: 4,
    },
  ],
};
