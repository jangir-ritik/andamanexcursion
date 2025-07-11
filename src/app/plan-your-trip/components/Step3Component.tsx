import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import * as Switch from "@radix-ui/react-switch";
import { TripFormData } from "../TripFormSchema";
import styles from "./Step3Component.module.css";
import { Input, Select } from "@/components/atoms";

interface Step3ComponentProps {
  form: UseFormReturn<TripFormData>;
}

const HOTEL_TYPES = [
  { value: "2-star", label: "2 Star" },
  { value: "3-star", label: "3 Star" },
  { value: "4-star", label: "4 Star" },
  { value: "5-star", label: "5 Star" },
  { value: "premium", label: "Premium" },
];

const ROOM_PREFERENCES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "premium", label: "Premium" },
  { value: "suite", label: "Suite" },
];

const FERRY_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "luxury", label: "Luxury Class" },
  { value: "premium", label: "Premium" },
];

const TIME_SLOTS = [
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
];

const FERRY_COMPANIES = [
  { value: "makruzz", label: "Makruzz Pearl" },
  { value: "green-ocean", label: "Green Ocean" },
  { value: "nautika", label: "Nautika" },
];

const MEAL_PREFERENCES = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "both", label: "Both" },
];

const TRANSPORTATION_OPTIONS = [
  { value: "taxi", label: "Taxi" },
  { value: "scooter", label: "Scooter" },
  { value: "car", label: "Car" },
  { value: "bike", label: "Bike" },
];

export const Step3Component: React.FC<Step3ComponentProps> = ({ form }) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className={styles.step3Container}>
      {/* Hotel Preferences Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Hotel Preferences</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Controller
                name="hotelPreferences.hotelType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Hotel Type"
                    options={HOTEL_TYPES}
                    hasError={!!errors.hotelPreferences?.hotelType}
                    placeholder="Select hotel type"
                  />
                )}
              />
              {errors.hotelPreferences?.hotelType && (
                <span className={styles.error}>
                  {errors.hotelPreferences.hotelType.message}
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <Controller
                name="hotelPreferences.roomPreference"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Room Preference"
                    options={ROOM_PREFERENCES}
                    hasError={!!errors.hotelPreferences?.roomPreference}
                    placeholder="Select room preference"
                  />
                )}
              />
              {errors.hotelPreferences?.roomPreference && (
                <span className={styles.error}>
                  {errors.hotelPreferences.roomPreference.message}
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <Input
                name="hotelPreferences.specificHotel"
                control={control}
                label="Specific Hotel (Optional)"
                placeholder="Enter specific hotel name"
                hasError={!!errors.hotelPreferences?.specificHotel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ferry Preferences Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Ferry Preferences</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Controller
                name="ferryPreferences.ferryClass"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Ferry Class"
                    options={FERRY_CLASSES}
                    hasError={!!errors.ferryPreferences?.ferryClass}
                    placeholder="Select ferry class"
                  />
                )}
              />
              {errors.ferryPreferences?.ferryClass && (
                <span className={styles.error}>
                  {errors.ferryPreferences.ferryClass.message}
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <Controller
                name="ferryPreferences.travelTimeSlot"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Travel Time Slot"
                    options={TIME_SLOTS}
                    hasError={!!errors.ferryPreferences?.travelTimeSlot}
                    placeholder="Select time slot"
                  />
                )}
              />
              {errors.ferryPreferences?.travelTimeSlot && (
                <span className={styles.error}>
                  {errors.ferryPreferences.travelTimeSlot.message}
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <Controller
                name="ferryPreferences.preferredFerry"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Preferred Ferry (Optional)"
                    options={FERRY_COMPANIES}
                    hasError={!!errors.ferryPreferences?.preferredFerry}
                    placeholder="Select preferred ferry"
                  />
                )}
              />
              {errors.ferryPreferences?.preferredFerry && (
                <span className={styles.error}>
                  {errors.ferryPreferences.preferredFerry.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Add-ons</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGrid}>
            <div className={styles.switchField}>
              <label htmlFor="airportPickup" className={styles.label}>
                Airport Pickup
              </label>
              <Controller
                name="addOns.airportPickup"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    id="airportPickup"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={styles.switch}
                  >
                    <Switch.Thumb className={styles.switchThumb} />
                  </Switch.Root>
                )}
              />
            </div>

            <div className={styles.switchField}>
              <label htmlFor="privateGuide" className={styles.label}>
                Private Guide
              </label>
              <Controller
                name="addOns.privateGuide"
                control={control}
                render={({ field }) => (
                  <Switch.Root
                    id="privateGuide"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={styles.switch}
                  >
                    <Switch.Thumb className={styles.switchThumb} />
                  </Switch.Root>
                )}
              />
            </div>

            <div className={styles.formField}>
              <Controller
                name="addOns.mealPreference"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Meal Preference"
                    options={MEAL_PREFERENCES}
                    hasError={!!errors.addOns?.mealPreference}
                    placeholder="Select meal preference"
                  />
                )}
              />
              {errors.addOns?.mealPreference && (
                <span className={styles.error}>
                  {errors.addOns.mealPreference.message}
                </span>
              )}
            </div>

            <div className={styles.formField}>
              <Controller
                name="addOns.transportation"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    label="Transportation"
                    options={TRANSPORTATION_OPTIONS}
                    hasError={!!errors.addOns?.transportation}
                    placeholder="Select transportation"
                  />
                )}
              />
              {errors.addOns?.transportation && (
                <span className={styles.error}>
                  {errors.addOns.transportation.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
