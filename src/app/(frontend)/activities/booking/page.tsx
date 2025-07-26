// "use client";
// import React, { Suspense } from "react";
// import { Section, Column, Row } from "@/components/layout";
// import styles from "./page.module.css";
// import { SectionTitle } from "@/components/atoms";
// import { BookingForm } from "@/components/organisms";
// import useActivityBooking from "@/hooks/useActivityBooking";
// import { useActivityBookingContext } from "@/context/ActivityBookingContext";
// import {
//   SearchSummary,
//   TimeFilters,
//   ActivityResults,
// } from "@/components/molecules/BookingResults";
// import { ACTIVITIES } from "@/data/activities";

// // Component that uses useSearchParams for the activity results
// const ActivitiesBookingContent = () => {
//   // Get basic booking parameters from useActivityBooking hook
//   const [bookingParams, bookingActions] = useActivityBooking();
//   const { SearchParamsLoader } = bookingActions;

//   // Get activity-specific state from context
//   const { activityState, setTimeFilter: setActivityTimeFilter } =
//     useActivityBookingContext();

//   const {
//     mainTimeGroup,
//     otherTimeGroups,
//     loading,
//     filteredActivities,
//     timeFilter,
//   } = activityState;

//   const { activity, date, time, passengers } = bookingParams;

//   const { handleSelectActivity } = bookingActions;

//   return (
//     <>
//       <SearchParamsLoader />
//       <SearchSummary
//         loading={loading}
//         resultCount={mainTimeGroup.length}
//         activity={activity}
//         date={date}
//         time={time}
//         timeFilter={timeFilter}
//         passengers={passengers}
//         type="activity"
//       />

//       {!loading && (
//         <TimeFilters
//           timeFilter={timeFilter}
//           setTimeFilter={setActivityTimeFilter}
//         />
//       )}

//       <ActivityResults
//         loading={loading}
//         mainTimeGroup={mainTimeGroup}
//         otherTimeGroups={otherTimeGroups}
//         filteredActivities={filteredActivities}
//         onSelectActivity={handleSelectActivity}
//       />
//     </>
//   );
// };

// // Component that uses useSearchParams for the title section
// const ActivityPageTitle = () => {
//   // Get booking parameters to access selected activity
//   const [bookingParams, bookingActions] = useActivityBooking();
//   const { SearchParamsLoader } = bookingActions;
//   const { activity: activityId } = bookingParams;

//   // Find the activity name from the ACTIVITIES array
//   const selectedActivity = ACTIVITIES.find((act) => act.id === activityId);
//   const activityName = selectedActivity ? selectedActivity.name : "activities";

//   // Determine the title based on whether an activity is selected
//   const titleText = `${activityName} in Andaman`;
//   const specialWord = `${activityName}`;

//   return (
//     <>
//       <SearchParamsLoader />
//       <SectionTitle
//         specialWord={specialWord}
//         text={titleText}
//         id="available-activities-title"
//       />
//     </>
//   );
// };

// export default function ActivitiesBookingPage() {
//   return (
//     <main className={styles.main}>
//       <Section
//         ariaLabelledby="booking-form-title"
//         id="booking-form-section"
//         className={styles.bookingHeader}
//       >
//         <h1 className={styles.pageTitle}>Activities Booking</h1>
//         <BookingForm
//           variant="compact"
//           initialTab="activities"
//           className={styles.bookingForm}
//           hideTabs={true}
//         />
//       </Section>

//       <Section
//         id="available-activities"
//         aria-labelledby="available-activities-title"
//         className={styles.availableActivities}
//       >
//         <Column
//           gap="var(--space-10)"
//           fullWidth
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <Row
//             justifyContent="between"
//             alignItems="center"
//             gap="var(--space-4)"
//             fullWidth
//           >
//             <ActivityPageTitle />
//           </Row>

//           <ActivitiesBookingContent />
//         </Column>
//       </Section>
//     </main>
//   );
// }

import React from "react";

function page() {
  return <div>page</div>;
}

export default page;
