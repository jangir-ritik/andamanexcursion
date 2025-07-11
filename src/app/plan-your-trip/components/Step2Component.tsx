import React, { useEffect, useMemo } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import * as Accordion from "@radix-ui/react-accordion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import { addDays, format, differenceInDays } from "date-fns";
import styles from "./Step2Component.module.css";
import { LocationSelect } from "@/components/atoms/LocationSelect/LocationSelect";
import { ActivitySelect } from "@/components/atoms/ActivitySelect/ActivitySelect";
import { Activity } from "@/components/atoms/ActivitySelect/ActivitySelect.types";
import { Location } from "@/components/atoms/LocationSelect/LocationSelect.types";
import { Textarea } from "@/components/atoms/Textarea/Textarea";

interface Step2ComponentProps {
  form: UseFormReturn<TripFormData>;
}

const DESTINATIONS: Location[] = [
  { id: "havelock", name: "Havelock Island" },
  { id: "neil", name: "Neil Island" },
  { id: "port-blair", name: "Port Blair" },
  { id: "ross", name: "Ross Island" },
  { id: "baratang", name: "Baratang Island" },
  { id: "rangat", name: "Rangat" },
  { id: "diglipur", name: "Diglipur" },
];

const ACTIVITIES: Activity[] = [
  { id: "scuba-diving", name: "Scuba Diving" },
  { id: "snorkeling", name: "Snorkeling" },
  { id: "beach-relaxation", name: "Beach Relaxation" },
  { id: "sightseeing", name: "Sightseeing" },
  { id: "water-sports", name: "Water Sports" },
  { id: "mangrove-tour", name: "Mangrove Tour" },
  { id: "historical-sites", name: "Historical Sites" },
  { id: "fishing", name: "Fishing" },
];

// Maximum reasonable number of days to generate
const MAX_DAYS = 30;

export const Step2Component: React.FC<Step2ComponentProps> = ({ form }) => {
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary",
  });

  const arrivalDate = watch("tripDetails.arrivalDate");
  const departureDate = watch("tripDetails.departureDate");

  // Calculate days difference with memoization to avoid recalculation
  const daysDifference = useMemo(() => {
    if (!arrivalDate || !departureDate) return 0;

    try {
      const start = new Date(arrivalDate);
      const end = new Date(departureDate);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

      // Use date-fns for more accurate calculation
      return differenceInDays(end, start) + 1;
    } catch (error) {
      console.error("Error calculating days difference:", error);
      return 0;
    }
  }, [arrivalDate, departureDate]);

  // Warning message for large date ranges
  const showWarning = daysDifference > MAX_DAYS;

  // Auto-generate itinerary days based on dates - optimized
  useEffect(() => {
    if (!arrivalDate || !departureDate) return;

    try {
      const start = new Date(arrivalDate);
      const end = new Date(departureDate);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      // Calculate days, but cap at MAX_DAYS to prevent performance issues
      const days = Math.min(
        Math.max(1, differenceInDays(end, start) + 1),
        MAX_DAYS
      );

      // Only update if the number of days has changed
      if (days > 0 && days !== fields.length) {
        // Use a more efficient approach for large arrays
        const newFields = Array.from({ length: days }, (_, i) => {
          const dayDate = addDays(start, i);
          return {
            day: i + 1,
            date: format(dayDate, "yyyy-MM-dd"),
            destination: "",
            activity: "",
            notes: "",
          };
        });

        // Remove all existing fields at once
        remove();

        // Batch append all fields at once
        append(newFields);
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
    }
  }, [
    daysDifference,
    arrivalDate,
    departureDate,
    fields.length,
    append,
    remove,
  ]);

  // Format date for display in the day header
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `(${format(date, "do MMMM yyyy")})`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.step2Container}>
      {/* <div className={styles.section}> */}
      {showWarning && (
        <div className={styles.warningMessage}>
          <AlertCircle size={16} />
          <span>
            You've selected a large date range ({daysDifference} days). For
            better performance, only the first {MAX_DAYS} days have been
            generated.
          </span>
        </div>
      )}

      {fields.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            Please complete your travel dates in Step 1 to plan your daily
            itinerary.
          </p>
        </div>
      ) : (
        <div className={styles.itineraryContainer}>
          {fields.map((field, index) => (
            <Accordion.Root
              key={field.id}
              type="single"
              collapsible
              defaultValue={index === 0 ? `day-${index}` : undefined}
              className={styles.accordion}
            >
              <Accordion.Item
                value={`day-${index}`}
                className={styles.accordionItem}
              >
                <Accordion.Trigger className={styles.accordionTrigger}>
                  <div className={styles.dayTitle}>
                    <span className={styles.day}>Day {field.day} </span>
                    <span className={styles.date}>
                      {formatDateForDisplay(field.date)}
                    </span>
                  </div>
                  <ChevronDown className={styles.chevron} />
                </Accordion.Trigger>
                <Accordion.Content className={styles.accordionContent}>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <Controller
                        name={`itinerary.${index}.destination`}
                        control={control}
                        render={({ field }) => (
                          <LocationSelect
                            value={field.value}
                            onChange={field.onChange}
                            label="Add Destination"
                            options={DESTINATIONS}
                            hasError={!!errors.itinerary?.[index]?.destination}
                            className={styles.selectComponent}
                          />
                        )}
                      />
                      {errors.itinerary?.[index]?.destination && (
                        <div className={styles.error}>
                          {errors.itinerary[index].destination?.message}
                        </div>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <Controller
                        name={`itinerary.${index}.activity`}
                        control={control}
                        render={({ field }) => (
                          <ActivitySelect
                            value={field.value}
                            onChange={field.onChange}
                            options={ACTIVITIES}
                            hasError={!!errors.itinerary?.[index]?.activity}
                            className={styles.selectComponent}
                            placeholder="Select your activity"
                          />
                        )}
                      />
                      {errors.itinerary?.[index]?.activity && (
                        <div className={styles.error}>
                          {errors.itinerary[index].activity?.message}
                        </div>
                      )}
                    </div>

                    <div className={styles.formField}>
                      <Controller
                        name={`itinerary.${index}.notes`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            name={`itinerary.${index}.notes`}
                            control={control}
                            rows={1}
                            label="Add Note (Optional)"
                            placeholder="Add custom notes for the day"
                          />
                        )}
                      />
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          ))}
        </div>
      )}

      {errors.itinerary && (
        <div className={styles.error}>{errors.itinerary.message}</div>
      )}
    </div>
    // </div>
  );
};
