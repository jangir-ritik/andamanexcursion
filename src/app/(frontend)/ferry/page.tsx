// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import { Section, Column } from "@/components/layout";

// import { ImageContainer } from "@/components/atoms";
// import { BookingForm } from "@/components/organisms";
// import {
//   TrustedFerries,
//   PlanInFourEasySteps,
// } from "@/components/sectionBlocks/ferry";
// import { Trivia } from "@/components/sectionBlocks/common";

// import {
//   FAQ,
//   LargeCardSection,
//   Partners,
//   Testimonials,
// } from "@/components/sectionBlocks/common";

// import { content } from "./page.content";

// import styles from "./page.module.css";

// import { useBooking } from "@/context/BookingContext";

// export default function FerryPage() {
//   const router = useRouter();
//   const { bookingState } = useBooking();

//   const handleViewFerries = () => {
//     // Navigate to booking page with current booking state
//     router.push(
//       `/ferry/booking?from=${bookingState.from}&to=${bookingState.to}&date=${
//         bookingState.date
//       }&time=${encodeURIComponent(bookingState.time)}&passengers=${
//         bookingState.adults + bookingState.children + bookingState.infants
//       }`
//     );
//   };

//   return (
//     <main className={styles.main}>
//       <Section noPadding id="hero">
//         <Column
//           gap="var(--space-8)"
//           fullWidth
//           responsive
//           responsiveAlignItems="start"
//           responsiveGap="var(--space-4)"
//         >
//           <ImageContainer
//             src={content.image}
//             alt={content.imageAlt}
//             aspectRatio="banner"
//             priority
//             fullWidth
//           />

//           <BookingForm initialTab="ferry" />
//         </Column>
//       </Section>

//       <PlanInFourEasySteps content={content.planInFourEasySteps} />
//       <TrustedFerries content={content.ferries} />
//       <Partners content={content.partners} />
//       <LargeCardSection content={content.largeCardSection} />
//       <Trivia content={content.trivia} />
//       <Testimonials content={content.testimonials} />
//       <FAQ content={content.faqSection} />
//       <LargeCardSection content={content.largeCardSection2} />
//     </main>
//   );
// }

import React from "react";

function page() {
  return <div>page</div>;
}

export default page;
