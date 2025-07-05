import heroImage from "@public/images/ferry/ferryBanner.png";
import seaWalkingImage from "@public/images/ferry/seaWalking/seaWalking.png";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import {
  FerryCardProps,
  FerryClassOption,
  FerryAmenity,
} from "@/components/molecules/Cards/FerryCard/FerryCard.types";

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
};

export interface AndamanCallingContent {}

export const andamanCallingContent: AndamanCallingContent = {};
