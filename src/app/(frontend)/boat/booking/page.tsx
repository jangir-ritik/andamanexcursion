// "use client";

// import React, { Suspense } from "react";
// import styles from "./page.module.css";
// import { BookingForm } from "@/components/organisms/BookingForm/BookingForm";
// import { Section } from "@/components/layout";

// // Create a client component that uses the hook
// function BoatBookingContent() {
//   // Import the hook inside the client component
//   const { useBoatBooking } = require("@/hooks/useBoatBooking");
//   const [bookingState, { setTimeFilter }] = useBoatBooking();

//   return (
//     <>
//       <h1>Boat Booking</h1>
//       <p>This page is under development.</p>
//       <p>
//         You searched for boats from {bookingState.from} to {bookingState.to} on{" "}
//         {bookingState.date} at {bookingState.time} for {bookingState.passengers}{" "}
//         passengers.
//       </p>
//     </>
//   );
// }

// // Main page component with suspense boundary
// export default function BoatBookingPage() {
//   return (
//     <main className={styles.main}>
//       <Section
//         ariaLabelledby="booking-form-title"
//         id="booking-form-section"
//         className={styles.bookingHeader}
//       >
//         <h1 className={styles.pageTitle}>Boat Booking</h1>
//         <BookingForm
//           variant="compact"
//           initialTab="local-boat"
//           className={styles.bookingForm}
//           hideTabs={true}
//         />
//       </Section>

//       <Suspense fallback={<p>Loading booking details...</p>}>
//         <BoatBookingContent />
//       </Suspense>
//     </main>
//   );
// }

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page