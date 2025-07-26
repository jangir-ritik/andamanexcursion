// "use client";
// import React from "react";
// import { useRouter } from "next/navigation";
// import { Controller } from "react-hook-form";
// import styles from "../BookingForm.module.css";
// import { useBooking } from "@/context/BookingContext";
// import { formatTimeForDisplay } from "@/utils/timeUtils";
// import { buildBookingUrlParams } from "@/utils/urlUtils";

// import {
//   Button,
//   DateSelect,
//   LocationSelect,
//   PassengerCounter,
//   SlotSelect,
// } from "@/components/atoms";

// import { BOAT_LOCATIONS } from "@/data/boats";
// import { TIME_SLOTS } from "../BookingForm.types";
// import {
//   boatFormSchema,
//   BoatFormValues,
//   getLocationNameById,
// } from "../schemas/formSchemas";
// import { useBookingForm } from "../hooks/acrhive__useBookingForm";
// import { cn } from "@/utils/cn";

// // Filter time slots for local boats
// const LOCAL_BOAT_TIME_SLOTS = TIME_SLOTS.filter((slot) =>
//   [
//     "08-00",
//     "08-30",
//     "09-00",
//     "09-30",
//     "10-00",
//     "10-30",
//     "11-00",
//     "11-30",
//     "12-00",
//     "12-30",
//   ].includes(slot.id)
// );

// interface BoatBookingFormProps {
//   className?: string;
//   variant?: "default" | "compact" | "embedded";
// }

// export function BoatBookingForm({
//   className,
//   variant = "default",
// }: BoatBookingFormProps) {
//   const router = useRouter();
//   const { bookingState, updateBookingState } = useBooking();

//   // Initialize form with our custom hook
//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useBookingForm<typeof boatFormSchema>(boatFormSchema, {
//     fromLocation:
//       bookingState.from === "Port Blair"
//         ? "port-blair"
//         : bookingState.from.toLowerCase().replace(/\s+/g, "-"),
//     toLocation:
//       bookingState.to === "Havelock"
//         ? "havelock"
//         : bookingState.to.toLowerCase().replace(/\s+/g, "-"),
//     selectedDate: new Date(bookingState.date),
//     selectedSlot: LOCAL_BOAT_TIME_SLOTS[0]?.id || "",
//     passengers: {
//       adults: bookingState.adults,
//       infants: bookingState.infants,
//       children: bookingState.children || 0,
//     },
//   });

//   const onSubmit = (data: BoatFormValues) => {
//     // Convert form state to booking state
//     const fromLocationName = getLocationNameById(data.fromLocation, "boat");
//     const toLocationName = getLocationNameById(data.toLocation, "boat");

//     const timeSlot =
//       LOCAL_BOAT_TIME_SLOTS.find((slot) => slot.id === data.selectedSlot)
//         ?.time || "11:00 AM";

//     // Standardize the time format
//     const standardizedTime = formatTimeForDisplay(timeSlot);

//     updateBookingState({
//       from: fromLocationName,
//       to: toLocationName,
//       date: data.selectedDate.toISOString().split("T")[0],
//       time: standardizedTime,
//       adults: data.passengers.adults,
//       children: data.passengers.children,
//       infants: data.passengers.infants,
//     });

//     // Build URL parameters
//     const urlParams = buildBookingUrlParams({
//       from: fromLocationName,
//       to: toLocationName,
//       date: data.selectedDate.toISOString().split("T")[0],
//       time: standardizedTime,
//       passengers:
//         data.passengers.adults +
//         data.passengers.children +
//         data.passengers.infants,
//       type: "boat",
//     });

//     // Navigate to booking page with search params
//     router.push(`/boat/booking?${urlParams}`);
//   };

//   // Create button text based on variant
//   const buttonText = variant === "compact" ? "Search" : "View Details";

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       aria-label="Boat Booking Form"
//       role="form"
//       aria-describedby="boat-booking-form-description"
//       aria-required="true"
//       aria-invalid={errors.fromLocation ? "true" : "false"}
//       aria-busy={isSubmitting ? "true" : "false"}
//       aria-live="polite"
//       className={cn(styles.formGrid, className)}
//     >
//       <div className={styles.locationSelectors}>
//         <div className={styles.formFieldContainer}>
//           <Controller
//             control={control}
//             name="fromLocation"
//             render={({ field }) => (
//               <LocationSelect
//                 value={field.value}
//                 onChange={field.onChange}
//                 label="From"
//                 options={BOAT_LOCATIONS || []}
//                 hasError={!!errors.fromLocation}
//               />
//             )}
//           />
//           {errors.fromLocation && (
//             <div className={styles.errorMessage}>
//               {errors.fromLocation.message}
//             </div>
//           )}
//         </div>

//         <div className={styles.formFieldContainer}>
//           <Controller
//             control={control}
//             name="toLocation"
//             render={({ field }) => (
//               <LocationSelect
//                 value={field.value}
//                 onChange={field.onChange}
//                 label="To"
//                 options={BOAT_LOCATIONS || []}
//                 hasError={!!errors.toLocation}
//               />
//             )}
//           />
//           {errors.toLocation && (
//             <div className={styles.errorMessage}>
//               {errors.toLocation.message}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className={styles.dateTimeSection}>
//         <div className={styles.formFieldContainer}>
//           <Controller
//             control={control}
//             name="selectedDate"
//             render={({ field }) => (
//               <DateSelect
//                 selected={field.value}
//                 onChange={(date) => field.onChange(date)}
//                 hasError={!!errors.selectedDate}
//               />
//             )}
//           />
//           {errors.selectedDate && (
//             <div className={styles.errorMessage}>
//               {errors.selectedDate.message}
//             </div>
//           )}
//         </div>

//         <div className={styles.formFieldContainer}>
//           <Controller
//             control={control}
//             name="selectedSlot"
//             render={({ field }) => (
//               <SlotSelect
//                 value={field.value}
//                 onChange={field.onChange}
//                 options={LOCAL_BOAT_TIME_SLOTS || []}
//                 hasError={!!errors.selectedSlot}
//               />
//             )}
//           />
//           {errors.selectedSlot && (
//             <div className={styles.errorMessage}>
//               {errors.selectedSlot.message}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className={styles.passengerButtonSection}>
//         <div
//           className={cn(
//             styles.formFieldContainer,
//             styles.passengerCounterContainer
//           )}
//         >
//           <Controller
//             control={control}
//             name="passengers"
//             render={({ field }) => (
//               <PassengerCounter
//                 value={field.value}
//                 onChange={(type, value) => {
//                   field.onChange({
//                     ...field.value,
//                     [type]: value,
//                   });
//                 }}
//                 hasError={!!errors.passengers}
//               />
//             )}
//           />
//           {errors.passengers && (
//             <div className={styles.errorMessage}>
//               {errors.passengers.message}
//             </div>
//           )}
//         </div>

//         <Button
//           variant="primary"
//           className={styles.viewDetailsButton}
//           showArrow
//           type="submit"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Loading..." : buttonText}
//         </Button>
//       </div>
//     </form>
//   );
// }
import React from "react";

function BoatBookingForm() {
  return <div>BoatBookingForm</div>;
}

export default BoatBookingForm;
