import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import activitiesHeroImage from "@public/images/activities/activities-hero.png";
import { ACTIVITIES_DATA } from "@/data/activities";

export const content = {
  image: activitiesHeroImage.src,
  imageAlt: "Activities Hero",
  subtitle: "Activities",
  title: "Explore the Best Water Activities in Andaman",
  description:
    "From snorkeling in coral gardens to jet skiing across blue horizons, your adventure begins here.",
  activitiesData: ACTIVITIES_DATA.map((activity) => ({
    ...activity,
    href: `/activities/booking?activity=${activity.id}`,
  })),
  faqSection: {
    title: "Get Answers to all Your Questions!",
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
      {
        question: "Is it safe to travel to Andaman Islands?",
        answer:
          "Yes, the Andaman Islands are very safe for tourists. The locals are friendly, and crime rates are low. However, always follow safety guidelines for water activities and respect protected tribal areas.",
      },
    ],
  },
  largeCardSection: {
    image: andamanCallingImage.src,
    imageAlt:
      "Beautiful beach view of Andaman Islands with crystal clear waters",
    title: "Andaman is Calling, Are You Ready?",
    ctaHref: "/packages",
    ctaText: "Customise this Package",
  },
};
