import heroImage from "@public/images/ferry/ferryBanner.png";
import seaWalkingImage from "@public/images/ferry/seaWalking/seaWalking.png";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { TestimonialsContent } from "@/components/sectionBlocks/common/testimonials/Testimonials.types";

import partner1 from "@public/icons/partners/dss.svg";
import partner2 from "@public/icons/partners/greenOcean.svg";
import partner3 from "@public/icons/partners/nautika.svg";
import partner4 from "@public/icons/partners/makruzz.svg";

import image1 from "@public/images/ferry/trustedFerries/goNautica.png";
import image2 from "@public/images/ferry/trustedFerries/makruzz.png";
import image3 from "@public/images/ferry/trustedFerries/greenOcean.png";

import step1 from "@public/icons/misc/location.svg";
import step2 from "@public/icons/misc/ship.svg";
import step3 from "@public/icons/misc/rupee.svg";
import step4 from "@public/icons/misc/ticket.svg";

import { TriviaContent } from "@/components/sectionBlocks/common";
import { PartnersContent } from "@/components/sectionBlocks/common/partners/Partners.types";
import { TrustedFerriesContent } from "@/components/sectionBlocks/ferry/trustedFerries/TrustedFerries";
import { PlanInFourEasyStepsContent } from "@/components/sectionBlocks/ferry/planInfourEasySteps/PlanInFourEasySteps.types";
import { Media } from "@payload-types";

// Sample icons for amenities
const premiumSeatingIcon = "/icons/misc/chair.svg";
const airConditionedIcon = "/icons/misc/wind.svg";
const onboardCafeIcon = "/icons/misc/teaCup.svg";
const extraLegSpaceIcon = "/icons/misc/legRoom.svg";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LargeCardSectionContent {
  subtitle?: string;
  title: string;
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaHref: string;
}

export interface FAQSectionContent {
  title: string;
  specialWord: string;
  items: FAQItem[];
}

export interface FerryPageContent {
  image: string;
  imageAlt: string;
  largeCardSection: LargeCardSectionContent;
  faqSection: FAQSectionContent;
  largeCardSection2: LargeCardSectionContent;
  ferryCards: FerryCardProps[];
  testimonials: TestimonialsContent;
  partners: PartnersContent;
  trivia: TriviaContent;
  ferries: TrustedFerriesContent[];
  planInFourEasySteps: PlanInFourEasyStepsContent;
}

export const content: FerryPageContent = {
  image: heroImage.src,
  imageAlt: "Ferry Banner",
  largeCardSection: {
    subtitle: "Sea Walking",
    title: "Walk the Ocean Floor, Touch the Wonders Below",
    image: seaWalkingImage.src,
    imageAlt: "Sea Walking",
    ctaText: "View Details",
    ctaHref: "/activities/sea-walking",
  },
  faqSection: {
    title: "Get Answers to all your Questions!",
    specialWord: "Answers",
    items: [
      {
        question: "What is the best time to visit Andaman Islands?",
        answer:
          "The ideal time to visit the Andaman Islands is between October and May. During these months, the weather is just right, perfect for scuba diving, snorkeling, ferry rides, and soaking up tropical vibes.",
      },
      {
        question: "Do I need a passport or visa to travel to Andaman?",
        answer:
          "Indian citizens do not need a passport or visa to visit the Andaman Islands, just a valid government ID proof. Foreign nationals require a passport and may need permits for certain areas.",
      },
      {
        question: "Can I customize my trip itinerary?",
        answer:
          "Yes, we offer fully customizable itineraries. Our travel experts will work with you to create a personalized experience based on your preferences, interests, and budget.",
      },
      {
        question: "What are the must-visit places in Andaman?",
        answer:
          "Must-visit places include Radhanagar Beach, Cellular Jail, Ross Island, North Bay Island, Havelock Island, and Neil Island. Each offers unique experiences from pristine beaches to historical sites.",
      },
    ],
  },
  largeCardSection2: {
    title: "Andaman Calling: Answer the Call of the Blue Waters",
    image: andamanCallingImage.src,
    imageAlt: "Andaman Calling",
    ctaText: "View Details",
    ctaHref: "/activities/andaman-calling",
  },
  ferryCards: [
    {
      ferryName: "Makruzz Pearl",
      rating: 4.9,
      departureTime: "11:00",
      departureLocation: "Port Blair",
      arrivalTime: "11:30",
      arrivalLocation: "Havelock",
      price: 1000,
      totalPrice: 2000,
      seatsLeft: 10,
      ferryClasses: [
        {
          type: "Luxury",
          price: 1000,
          totalPrice: 2000,
          seatsLeft: 3,
          amenities: [
            {
              icon: premiumSeatingIcon,
              label: "Premium Seating",
            },
            {
              icon: airConditionedIcon,
              label: "Air conditioned",
            },
            {
              icon: onboardCafeIcon,
              label: "Onboard Cafe",
            },
          ],
        },
        {
          type: "Royal",
          price: 1000,
          totalPrice: 2000,
          seatsLeft: 3,
          amenities: [
            {
              icon: premiumSeatingIcon,
              label: "Premium Seating",
            },
            {
              icon: airConditionedIcon,
              label: "Air conditioned",
            },
            {
              icon: onboardCafeIcon,
              label: "Onboard Cafe",
            },
            {
              icon: extraLegSpaceIcon,
              label: "Extra Leg Space",
            },
          ],
        },
      ],
    },
    {
      ferryName: "Green Ocean",
      rating: 4.5,
      departureTime: "13:00",
      departureLocation: "Port Blair",
      arrivalTime: "13:45",
      arrivalLocation: "Havelock",
      price: 950,
      totalPrice: 1900,
      seatsLeft: 15,
      ferryClasses: [
        {
          type: "Premium",
          price: 950,
          totalPrice: 1900,
          seatsLeft: 8,
          amenities: [
            {
              icon: premiumSeatingIcon,
              label: "Premium Seating",
            },
            {
              icon: airConditionedIcon,
              label: "Air conditioned",
            },
            {
              icon: onboardCafeIcon,
              label: "Onboard Cafe",
            },
          ],
        },
        {
          type: "Economy",
          price: 800,
          totalPrice: 1600,
          seatsLeft: 7,
          amenities: [
            {
              icon: premiumSeatingIcon,
              label: "Standard Seating",
            },
            {
              icon: airConditionedIcon,
              label: "Air conditioned",
            },
          ],
        },
      ],
    },
  ],
  testimonials: {
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
  },
  partners: {
    title: "Our Trusted Partners",
    specialWord: "Partners",
    partners: [
      { partner: partner1, alt: "dss" },
      { partner: partner2, alt: "greenOcean" },
      { partner: partner3, alt: "nautika" },
      { partner: partner4, alt: "makruzz" },
    ],
  },
  trivia: {
    title: "Did you know?",
    text: "Port Blair is home to the iconic Cellular Jail, a historic symbol of India's freedom struggle",
    highlightedPhrases: [
      { phrase: "Cellular Jail", id: "Cellular Jail" },
      { phrase: "historic symbol", id: "historic symbol" },
    ],
  },
  ferries: [
    {
      image: image1.src,
      imageAlt: "Go Nautica",
      title: "Go Nautica",
      price: "Starting @₹1,520",
      rating: 4.9,
      href: "/ferry/go-nautica",
    },
    {
      image: image2.src,
      imageAlt: "IIT Majestic",
      title: "IIT Majestic",
      price: "Starting @₹1,520",
      rating: 4.5,
      href: "/packages/family-fiesta",
    },
    {
      image: image3.src,
      imageAlt: "Green Ocean",
      title: "Green Ocean",
      price: "Starting @₹1,520",
      rating: 4.0,
      href: "/packages/honeymoon-whispers",
    },
  ],
  planInFourEasySteps: {
    title: "Plan your Ride in 4 Easy Steps!",
    specialWord: "4 Easy Steps!",
    steps: [
      {
        title: "Select Your Route",
        description: "Select your islands and travel date to get started.",
        icon: step1,
      },
      {
        title: "Compare Ferries",
        description: "Add passenger info and confirm your booking.",
        icon: step2,
      },
      {
        title: "Book Seamlessly",
        description: "Enter passenger details and book with secure payment.",
        icon: step3,
      },
      {
        title: "Board your Boat",
        description:
          "Get your e-ticket on email. Reach the terminal & sail away!",
        icon: step4,
      },
    ],
    description:
      "From island-hopping to water adventures, book smooth ferry rides tailored to your travel plan.",
  },
};
