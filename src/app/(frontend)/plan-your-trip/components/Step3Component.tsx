import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import * as Switch from "@radix-ui/react-switch";
import { TripFormData } from "../TripFormSchema";
import {
  HOTEL_TYPES,
  ROOM_PREFERENCES,
  FERRY_CLASSES,
  TIME_SLOTS,
  FERRY_COMPANIES,
  MEAL_PREFERENCES,
  TRANSPORTATION_OPTIONS,
} from "@/constants";
import styles from "./Step3Component.module.css";
import { Input, Select } from "@/components/atoms";

interface Step3ComponentProps {
  form: UseFormReturn<TripFormData>;
}

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
                    required
                    hasError={!!errors.hotelPreferences?.hotelType}
                    placeholder="Select hotel type"
                    errorMessage={errors.hotelPreferences?.hotelType?.message}
                  />
                )}
              />
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
                    required
                    hasError={!!errors.hotelPreferences?.roomPreference}
                    placeholder="Select room preference"
                    errorMessage={
                      errors.hotelPreferences?.roomPreference?.message
                    }
                  />
                )}
              />
            </div>

            <div className={styles.formField}>
              <Input
                name="hotelPreferences.specificHotel"
                control={control}
                label="Specific Hotel (Optional)"
                placeholder="Enter specific hotel name"
                hasError={!!errors.hotelPreferences?.specificHotel}
                errorMessage={errors.hotelPreferences?.specificHotel?.message}
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
                    required
                    hasError={!!errors.ferryPreferences?.ferryClass}
                    placeholder="Select ferry class"
                    errorMessage={errors.ferryPreferences?.ferryClass?.message}
                  />
                )}
              />
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
                    required
                    hasError={!!errors.ferryPreferences?.travelTimeSlot}
                    placeholder="Select time slot"
                    errorMessage={
                      errors.ferryPreferences?.travelTimeSlot?.message
                    }
                  />
                )}
              />
            </div>

            <div className={styles.formField}>
              <Controller
                name="ferryPreferences.preferredFerry"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Preferred Ferry (Optional)"
                    options={FERRY_COMPANIES}
                    hasError={!!errors.ferryPreferences?.preferredFerry}
                    placeholder="Select preferred ferry"
                    errorMessage={
                      errors.ferryPreferences?.preferredFerry?.message
                    }
                  />
                )}
              />
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
                    required
                    hasError={!!errors.addOns?.mealPreference}
                    placeholder="Select meal preference"
                    errorMessage={errors.addOns?.mealPreference?.message}
                  />
                )}
              />
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
                    required
                    hasError={!!errors.addOns?.transportation}
                    placeholder="Select transportation"
                    errorMessage={errors.addOns?.transportation?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
