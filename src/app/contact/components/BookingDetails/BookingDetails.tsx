import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { ContactFormData } from "../ContactForm/ContactForm.types";
import styles from "./BookingDetails.module.css";
import { DateSelect } from "@/components/atoms";
import { cn } from "@/utils/cn";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

interface BookingDetailsProps {
  form: UseFormReturn<ContactFormData>;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({ form }) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
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
        <div className={styles.row}>
          {/* Package Field */}
          <div className={cn(styles.gridItem, styles.package)}>
            <label className={styles.label}>Package</label>
            <Controller
              control={control}
              name="booking.package"
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value
                      data-select-value
                      className={styles.selectValue}
                    >
                      {packageOptions.find(
                        (option) => option.value === field.value
                      )?.label || "Select package"}
                    </Select.Value>
                    <Select.Icon>
                      <ChevronDown size={20} className={styles.selectIcon} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className={styles.selectContent}
                      position="popper"
                      sideOffset={8}
                    >
                      <Select.Viewport>
                        {packageOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{option.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.booking?.package && (
              <span className={styles.errorMessage}>
                {errors.booking.package.message}
              </span>
            )}
          </div>

          {/* Duration Field */}
          <div className={cn(styles.gridItem, styles.duration)}>
            <label className={styles.label}>Duration</label>
            <Controller
              control={control}
              name="booking.duration"
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value
                      data-select-value
                      className={styles.selectValue}
                    >
                      {durationOptions.find(
                        (option) => option.value === field.value
                      )?.label || "Select duration"}
                    </Select.Value>
                    <Select.Icon>
                      <ChevronDown size={20} className={styles.selectIcon} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className={styles.selectContent}
                      position="popper"
                      sideOffset={8}
                    >
                      <Select.Viewport>
                        {durationOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{option.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.booking?.duration && (
              <span className={styles.errorMessage}>
                {errors.booking.duration.message}
              </span>
            )}
          </div>

          {/* Amount Field */}
          <div className={cn(styles.gridItem, styles.amount)}>
            <label className={styles.label}>Total Amount</label>
            <div className={styles.amountText}>₹3775/adult</div>
          </div>
        </div>

        <div className={styles.row}>
          {/* Check In Field */}
          <div className={cn(styles.gridItem, styles.date)}>
            <Controller
              control={control}
              name="booking.checkIn"
              render={({ field }) => (
                <DateSelect
                  selected={field.value}
                  onChange={field.onChange}
                  className={styles.dateSelect}
                  label="Check In"
                  hasError={!!errors.booking?.checkIn}
                />
              )}
            />
            {errors.booking?.checkIn && (
              <span className={styles.errorMessage}>
                {errors.booking.checkIn.message}
              </span>
            )}
          </div>

          {/* Check Out Field */}
          <div className={cn(styles.gridItem, styles.date)}>
            <Controller
              control={control}
              name="booking.checkOut"
              render={({ field }) => (
                <DateSelect
                  selected={field.value}
                  onChange={field.onChange}
                  className={styles.dateSelect}
                  label="Check Out"
                  hasError={!!errors.booking?.checkOut}
                />
              )}
            />
            {errors.booking?.checkOut && (
              <span className={styles.errorMessage}>
                {errors.booking.checkOut.message}
              </span>
            )}
          </div>

          {/* Adults Counter */}
          <div className={cn(styles.gridItem, styles.counter)}>
            <label className={styles.label}>Adults</label>
            <div className={styles.passengerCounter}>
              <div className={styles.passengerControls}>
                <button
                  type="button"
                  className={styles.passengerButton}
                  onClick={() =>
                    setValue(
                      "booking.adults",
                      Math.max(1, watchedValues.adults - 1)
                    )
                  }
                >
                  -
                </button>
                <span className={styles.passengerValue}>
                  {watchedValues.adults}
                </span>
                <button
                  type="button"
                  className={styles.passengerButton}
                  onClick={() =>
                    setValue(
                      "booking.adults",
                      Math.min(10, watchedValues.adults + 1)
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
            {errors.booking?.adults && (
              <span className={styles.errorMessage}>
                {errors.booking.adults.message}
              </span>
            )}
          </div>

          {/* Children Counter */}
          <div className={cn(styles.gridItem, styles.counter)}>
            <label className={styles.label}>Kids</label>
            <div className={styles.passengerCounter}>
              <div className={styles.passengerControls}>
                <button
                  type="button"
                  className={styles.passengerButton}
                  onClick={() =>
                    setValue(
                      "booking.children",
                      Math.max(0, watchedValues.children - 1)
                    )
                  }
                >
                  -
                </button>
                <span className={styles.passengerValue}>
                  {watchedValues.children}
                </span>
                <button
                  type="button"
                  className={styles.passengerButton}
                  onClick={() =>
                    setValue(
                      "booking.children",
                      Math.min(10, watchedValues.children + 1)
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
            {errors.booking?.children && (
              <span className={styles.errorMessage}>
                {errors.booking.children.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
