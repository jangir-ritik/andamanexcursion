import scubaDiving from "@public/images/homepage/scubaDivingCTA/diver.png";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import heroImage from "@public/images/homepage/banner/heroBanner.png";

import partner1 from "@public/icons/partners/dss.svg";
import partner2 from "@public/icons/partners/greenOcean.svg";
import partner3 from "@public/icons/partners/nautika.svg";
import partner4 from "@public/icons/partners/makruzz.svg";

import island1 from "@public/images/homepage/hiddenGems/hiddenGems1.png";
import island2 from "@public/images/homepage/hiddenGems/hiddenGems2.png";
import island3 from "@public/images/homepage/hiddenGems/hiddenGems3.png";

export const content = {
  banner: {
    title: "Explore",
    subtitle: "Andaman!",
    description:
      "Uncover pristine beaches, hidden adventures, and unforgettable sunsets across the Andaman Islands.",
    image: heroImage.src,
    imageAlt: "Beautiful Andaman Islands",
  },
  largeCardSection: {
    subtitle: "Scuba Diving",
    title: "Dive Beneath Waves, Discover Hidden Worlds",
    image: scubaDiving.src,
    imageAlt: "Scuba diver exploring coral reef in the Andaman Sea",
    ctaText: "View Details",
    ctaHref: "/scuba-diving",
  },
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
  largeCardSection2: {
    image: andamanCallingImage.src,
    imageAlt:
      "Beautiful beach view of Andaman Islands with crystal clear waters",
    title: "Andaman is Calling, Are You Ready?",
    ctaHref: "/packages",
    ctaText: "Explore Packages",
  },
  testimonials: {
    title: "Our Client Appreciations Keeps Us Going",
    specialWord: "Client Appreciations",
    subtitle: "All testimonials are pulled from authentic Google reviews.",
    testimonials: [
      {
        id: 1,
        text: "From start to finish, the experience was seamless. The crew was attentive, the boats were spotless, and every island we visited felt like a private paradise. Would book again in a heartbeat.",
        author: "Rohit Verma",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: -6,
      },
      {
        id: 2,
        text: "I've been on many boat tours, but this one stood out. The timing, hospitality, and hidden gems we explored made this feel like more than just a vacation—it was an adventure.",
        author: "Sneha Kulkarni",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: 3,
      },
      {
        id: 3,
        text: "Booking with Andaman Excursion was the best decision we made on our trip. Each destination was more beautiful than the last. The guides clearly love what they do.",
        author: "Vikram Nair",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: 0,
      },
      {
        id: 4,
        text: "A perfect blend of thrill and tranquility. We snorkeled, explored untouched beaches, and watched sunsets that looked straight out of a movie. Unforgettable moments throughout.",
        author: "Meera Joshi",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: 5,
      },
      {
        id: 5,
        text: "Every detail was taken care of—from pick-up to the smallest island hop. It was smooth, scenic, and simply magical. Highly recommend to anyone visiting the Andamans.",
        author: "Tanishq Mehta",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: -4,
      },
      {
        id: 6,
        text: "The crew was friendly, knowledgeable, and made sure we had the best experience. The islands were breathtaking, and the snorkeling was incredible. I'll definitely be back!",
        author: "Rajesh Kumar",
        avatar: "/images/homepage/testimonials/avatar.png",
        rotation: 4,
      },
    ],
  },
  partners: {
    title: "Our Trusted Partners",
    specialWord: "Partners",
    partners: [partner1, partner2, partner3, partner4],
    partnersAlt: ["dss", "greenOcean", "nautika", "makruzz"],
  },
  hiddenGems: {
    title: "Discover Andaman's Hidden Gems!",
    specialWord: "Hidden Gems!",
    description:
      "Step off the beaten path and uncover untouched islands, secret beaches, and serene waters that most tourists never see.",
    ctaText: "Book Now",
    ctaHref: "/booking",
    images: {
      island1: {
        src: island1.src,
        alt: "Secluded beach with crystal clear waters in Andaman",
      },
      island2: {
        src: island2.src,
        alt: "Hidden cove surrounded by lush greenery",
      },
      island3: {
        src: island3.src,
        alt: "Pristine white sand beach with turquoise waters",
      },
    },
  },
};
