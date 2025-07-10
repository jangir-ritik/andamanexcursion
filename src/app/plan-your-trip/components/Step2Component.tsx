import React, { useEffect } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import * as Accordion from "@radix-ui/react-accordion";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import { addDays, format } from "date-fns";
import styles from "./Step2Component.module.css";

interface Step2ComponentProps {
  form: UseFormReturn<TripFormData>;
}

const DESTINATIONS = [
  { value: "havelock", label: "Havelock Island" },
  { value: "neil", label: "Neil Island" },
  { value: "port-blair", label: "Port Blair" },
  { value: "ross", label: "Ross Island" },
  { value: "baratang", label: "Baratang Island" },
  { value: "rangat", label: "Rangat" },
  { value: "diglipur", label: "Diglipur" },
];

const ACTIVITIES = [
  { value: "scuba-diving", label: "Scuba Diving" },
  { value: "snorkeling", label: "Snorkeling" },
  { value: "beach-relaxation", label: "Beach Relaxation" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "water-sports", label: "Water Sports" },
  { value: "mangrove-tour", label: "Mangrove Tour" },
  { value: "historical-sites", label: "Historical Sites" },
  { value: "fishing", label: "Fishing" },
];

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

  // Auto-generate itinerary days based on dates
  useEffect(() => {
    if (arrivalDate && departureDate) {
      const start = new Date(arrivalDate);
      const end = new Date(departureDate);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (days > 0 && days !== fields.length) {
        // Clear existing fields
        fields.forEach((_, index) => remove(index));

        // Add new fields for each day
        for (let i = 0; i < days; i++) {
          const dayDate = addDays(start, i);
          append({
            day: i + 1,
            date: format(dayDate, "dd/MM/yyyy"),
            destination: "",
            activity: "",
            notes: "",
          });
        }
      }
    }
  }, [arrivalDate, departureDate, fields.length, append, remove]);

  return (
    <div className={styles.step2Container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Plan Your Daily Itinerary</h3>

        {fields.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              Please complete your travel dates in Step 1 to plan your daily
              itinerary.
            </p>
          </div>
        ) : (
          <Accordion.Root type="multiple" className={styles.accordion}>
            {fields.map((field, index) => (
              <Accordion.Item
                key={field.id}
                value={`day-${index}`}
                className={styles.accordionItem}
              >
                <Accordion.Header className={styles.accordionHeader}>
                  <Accordion.Trigger className={styles.accordionTrigger}>
                    <div className={styles.dayHeader}>
                      <span className={styles.dayNumber}>Day {field.day}</span>
                      <span className={styles.dayDate}>({field.date})</span>
                    </div>
                    <ChevronDown className={styles.chevron} />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className={styles.accordionContent}>
                  <div className={styles.dayContent}>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label className={styles.label}>Destination</label>
                        <Controller
                          name={`itinerary.${index}.destination`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.Trigger className={styles.selectTrigger}>
                                <Select.Value placeholder="Select destination" />
                                <Select.Icon>
                                  <ChevronDown size={16} />
                                </Select.Icon>
                              </Select.Trigger>
                              <Select.Portal>
                                <Select.Content
                                  className={styles.selectContent}
                                >
                                  <Select.Viewport>
                                    {DESTINATIONS.map((dest) => (
                                      <Select.Item
                                        key={dest.value}
                                        value={dest.value}
                                        className={styles.selectItem}
                                      >
                                        <Select.ItemText>
                                          {dest.label}
                                        </Select.ItemText>
                                      </Select.Item>
                                    ))}
                                  </Select.Viewport>
                                </Select.Content>
                              </Select.Portal>
                            </Select.Root>
                          )}
                        />
                        {errors.itinerary?.[index]?.destination && (
                          <div className={styles.error}>
                            {errors.itinerary[index].destination?.message}
                          </div>
                        )}
                      </div>

                      <div className={styles.formField}>
                        <label className={styles.label}>Activity</label>
                        <Controller
                          name={`itinerary.${index}.activity`}
                          control={control}
                          render={({ field }) => (
                            <Select.Root
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.Trigger className={styles.selectTrigger}>
                                <Select.Value placeholder="Select activity" />
                                <Select.Icon>
                                  <ChevronDown size={16} />
                                </Select.Icon>
                              </Select.Trigger>
                              <Select.Portal>
                                <Select.Content
                                  className={styles.selectContent}
                                >
                                  <Select.Viewport>
                                    {ACTIVITIES.map((activity) => (
                                      <Select.Item
                                        key={activity.value}
                                        value={activity.value}
                                        className={styles.selectItem}
                                      >
                                        <Select.ItemText>
                                          {activity.label}
                                        </Select.ItemText>
                                      </Select.Item>
                                    ))}
                                  </Select.Viewport>
                                </Select.Content>
                              </Select.Portal>
                            </Select.Root>
                          )}
                        />
                        {errors.itinerary?.[index]?.activity && (
                          <div className={styles.error}>
                            {errors.itinerary[index].activity?.message}
                          </div>
                        )}
                      </div>

                      <div className={styles.formField}>
                        <label className={styles.label}>Notes (Optional)</label>
                        <Controller
                          name={`itinerary.${index}.notes`}
                          control={control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              className={styles.textarea}
                              placeholder="Add custom notes for the day"
                              rows={3}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}

        {errors.itinerary && (
          <div className={styles.error}>{errors.itinerary.message}</div>
        )}
      </div>
    </div>
  );
};
