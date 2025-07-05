import image1 from "@public/images/activities/activitiesList/1.png";
import image2 from "@public/images/activities/activitiesList/2.png";
import image3 from "@public/images/activities/activitiesList/3.png";
import image4 from "@public/images/activities/activitiesList/4.png";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import activitiesHeroImage from "@public/images/activities/activities-hero.png";

export const content = {
  image: activitiesHeroImage.src,
  imageAlt: "Activities Hero",
  subtitle: "Activities",
  title: "Explore the Best Water Activities in Andaman",
  description:
    "From snorkeling in coral gardens to jet skiing across blue horizons, your adventure begins here.",
  activitiesData: [
    {
      id: "1",
      image: image1,
      imageAlt: "Snorkeling in coral gardens",
      title: "Snorkeling in Coral Gardens",
      description: "Explore the vibrant coral gardens and marine life",
      href: "/activities/snorkeling",
      rating: 4.8,
    },
    {
      id: "2",
      image: image2,
      imageAlt: "Parasailing over blue waters",
      title: "Parasailing over Blue Waters",
      description: "Experience the thrill of flying over the ocean",
      href: "/activities/parasailing",
      rating: 4.9,
    },
    {
      id: "3",
      image: image3,
      imageAlt: "Scuba diving in clear waters",
      title: "Scuba Diving in Clear Waters",
      description: "Discover the underwater world with professional guidance",
      href: "/activities/scuba-diving",
      rating: 4.7,
    },
    {
      id: "4",
      image: image4,
      imageAlt: "Group snorkeling experience",
      title: "Group Snorkeling Experience",
      description: "Explore the coral gardens with a group of friends",
      href: "/activities/group-snorkeling",
      rating: 4.6,
    },
    {
      id: "5",
      image: image1,
      imageAlt: "Advanced scuba diving",
      title: "Advanced Scuba Diving",
      description: "Experience the thrill of deep sea diving",
      href: "/activities/advanced-scuba",
      rating: 4.9,
    },
    {
      id: "6",
      image: image2,
      imageAlt: "Tandem parasailing",
      title: "Tandem Parasailing",
      description: "Experience the thrill of flying over the ocean",
      href: "/activities/tandem-parasailing",
      rating: 4.8,
    },
    {
      id: "7",
      image: image3,
      imageAlt: "Night snorkeling adventure",
      title: "Night Snorkeling Adventure",
      description: "Explore the underwater world at night",
      href: "/activities/night-snorkeling",
      rating: 4.5,
    },
    {
      id: "8",
      image: image4,
      imageAlt: "Jet skiing across blue waters",
      title: "Jet Skiing Across Blue Waters",
      description: "Experience the thrill of riding on the ocean",
      href: "/activities/jet-skiing",
      rating: 4.7,
    },
    {
      id: "9",
      image: image1,
      imageAlt: "Deep sea diving expedition",
      title: "Deep Sea Diving Expedition",
      description: "Experience the thrill of deep sea diving",
      href: "/activities/deep-sea-diving",
      rating: 4.9,
    },
  ],
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
