// components/ContactForm/BookingDetails/BookingDetails.tsx
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../../page";
// import { Select } from "@/components/atoms";
// import { Counter } from "@/components/atoms";
// import { DatePicker } from "@/components/atoms";
import styles from "./BookingDetails.module.css";

interface BookingDetailsProps {
  form: UseFormReturn<ContactFormData>;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const watchedValues = watch("booking");

  const packageOptions = [
    {
      value: "beach-front-romance-port-blair",
      label: "Beach Front Romance - Port Blair",
    },
    { value: "island-hopping-adventure", label: "Island Hopping Adventure" },
    { value: "cultural-heritage-tour", label: "Cultural Heritage Tour" },
  ];

  const durationOptions = [
    { value: "4-nights-5-days", label: "4 Nights - 5 Days" },
    { value: "3-nights-4-days", label: "3 Nights - 4 Days" },
    { value: "5-nights-6-days", label: "5 Nights - 6 Days" },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Details</h2>

      <div className={styles.grid}>
        <div className={styles.gridItem}>
          <label className={styles.label}>Package</label>
          {/* <Select
            name="booking.package"
            control={control}
            options={packageOptions}
            placeholder="Select package"
          /> */}
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Duration</label>
          {/* <Select
            name="booking.duration"
            control={control}
            options={durationOptions}
            placeholder="Select duration"
          /> */}
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Total Amount</label>
          <div className={styles.amount}>₹3775/adult</div>
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Check In</label>
          {/* <DatePicker
            name="booking.checkIn"
            control={control}
            placeholder="27 May 2025"
          /> */}
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Check Out</label>
          {/* <DatePicker
            name="booking.checkOut"
            control={control}
            placeholder="01 Jun 2025"
          /> */}
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Adults</label>
          {/* <Counter
            value={watchedValues.adults}
            onChange={(value) => setValue("booking.adults", value)}
            min={1}
            max={10}
          /> */}
        </div>

        <div className={styles.gridItem}>
          <label className={styles.label}>Kids</label>
          {/* <Counter
            value={watchedValues.children}
            onChange={(value) => setValue("booking.children", value)}
            min={0}
            max={10}
          /> */}
        </div>
      </div>
    </section>
  );
};
