import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import styles from "./Step1Component.module.css";

interface Step1ComponentProps {
  form: UseFormReturn<TripFormData>;
}

const TRAVEL_GOALS = [
  { id: "relaxation", label: "Relaxation & culture" },
  { id: "adventure", label: "Adventure & sports" },
  { id: "reserved", label: "Reserved" },
  { id: "unexplored", label: "Unexplored islands" },
  { id: "family", label: "Family-friendly activities" },
];

const SPECIAL_OCCASIONS = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "solo", label: "Solo trip" },
  { id: "other", label: "Other" },
];

export const Step1Component: React.FC<Step1ComponentProps> = ({ form }) => {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className={styles.step1Container}>
      {/* Personal Details Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Details</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="personalDetails.name">
              Name
            </label>
            <Controller
              name="personalDetails.name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="personalDetails.name"
                  className={styles.input}
                  placeholder="Enter your name"
                />
              )}
            />
            {errors.personalDetails?.name && (
              <span className={styles.error}>
                {errors.personalDetails.name.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="personalDetails.email">
              Email
            </label>
            <Controller
              name="personalDetails.email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="personalDetails.email"
                  type="email"
                  className={styles.input}
                  placeholder="Enter your email"
                />
              )}
            />
            {errors.personalDetails?.email && (
              <span className={styles.error}>
                {errors.personalDetails.email.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="personalDetails.phone">
              Phone Number
            </label>
            <Controller
              name="personalDetails.phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="personalDetails.phone"
                  type="tel"
                  className={styles.input}
                  placeholder="+91 00000 00000"
                />
              )}
            />
            {errors.personalDetails?.phone && (
              <span className={styles.error}>
                {errors.personalDetails.phone.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trip Details Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>When Are You Planning to Visit?</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="tripDetails.arrivalDate">
              Arrival Date
            </label>
            <Controller
              name="tripDetails.arrivalDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="tripDetails.arrivalDate"
                  type="date"
                  className={styles.input}
                />
              )}
            />
            {errors.tripDetails?.arrivalDate && (
              <span className={styles.error}>
                {errors.tripDetails.arrivalDate.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="tripDetails.departureDate">
              Departure Date
            </label>
            <Controller
              name="tripDetails.departureDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="tripDetails.departureDate"
                  type="date"
                  className={styles.input}
                />
              )}
            />
            {errors.tripDetails?.departureDate && (
              <span className={styles.error}>
                {errors.tripDetails.departureDate.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="tripDetails.adults">
              Adults
            </label>
            <Controller
              name="tripDetails.adults"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="tripDetails.adults"
                  type="number"
                  min="1"
                  className={styles.input}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            {errors.tripDetails?.adults && (
              <span className={styles.error}>
                {errors.tripDetails.adults.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="tripDetails.children">
              Children
            </label>
            <Controller
              name="tripDetails.children"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="tripDetails.children"
                  type="number"
                  min="0"
                  className={styles.input}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            {errors.tripDetails?.children && (
              <span className={styles.error}>
                {errors.tripDetails.children.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Travel Goals Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Travel Goals</h3>
        <div className={styles.checkboxGrid}>
          {TRAVEL_GOALS.map((goal) => (
            <Controller
              key={goal.id}
              name="travelGoals"
              control={control}
              render={({ field }) => (
                <div className={styles.checkboxItem}>
                  <Checkbox.Root
                    id={goal.id}
                    checked={field.value?.includes(goal.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, goal.id]);
                      } else {
                        field.onChange(
                          field.value?.filter((id) => id !== goal.id)
                        );
                      }
                    }}
                    className={styles.checkbox}
                  >
                    <Checkbox.Indicator className={styles.checkboxIndicator}>
                      <Check size={14} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={goal.id} className={styles.checkboxLabel}>
                    {goal.label}
                  </label>
                </div>
              )}
            />
          ))}
        </div>
        {errors.travelGoals && (
          <span className={styles.error}>{errors.travelGoals.message}</span>
        )}
      </div>

      {/* Special Occasion Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Special Occasion (Optional)</h3>
        <div className={styles.checkboxGrid}>
          {SPECIAL_OCCASIONS.map((occasion) => (
            <Controller
              key={occasion.id}
              name="specialOccasion"
              control={control}
              render={({ field }) => (
                <div className={styles.checkboxItem}>
                  <Checkbox.Root
                    id={occasion.id}
                    checked={field.value?.includes(occasion.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...(field.value || []), occasion.id]);
                      } else {
                        field.onChange(
                          field.value?.filter((id) => id !== occasion.id)
                        );
                      }
                    }}
                    className={styles.checkbox}
                  >
                    <Checkbox.Indicator className={styles.checkboxIndicator}>
                      <Check size={14} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={occasion.id} className={styles.checkboxLabel}>
                    {occasion.label}
                  </label>
                </div>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
