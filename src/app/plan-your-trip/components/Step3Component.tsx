import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import * as Switch from "@radix-ui/react-switch";
import { ChevronDown } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import styles from "./Step3Component.module.css";

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
      {/* Hotel Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Hotel Preferences</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="hotelType" className={styles.label}>
              Hotel Type
            </label>
            <Controller
              name="hotelPreferences.hotelType"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select hotel type" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {HOTEL_TYPES.map((type) => (
                          <Select.Item
                            key={type.value}
                            value={type.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{type.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.hotelPreferences?.hotelType && (
              <span className={styles.error}>
                {errors.hotelPreferences.hotelType.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="roomPreference" className={styles.label}>
              Room Preference
            </label>
            <Controller
              name="hotelPreferences.roomPreference"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select room preference" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {ROOM_PREFERENCES.map((pref) => (
                          <Select.Item
                            key={pref.value}
                            value={pref.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{pref.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.hotelPreferences?.roomPreference && (
              <span className={styles.error}>
                {errors.hotelPreferences.roomPreference.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="specificHotel" className={styles.label}>
              Specific Hotel (Optional)
            </label>
            <input
              id="specificHotel"
              {...register("hotelPreferences.specificHotel")}
              className={styles.input}
              placeholder="Enter specific hotel name"
            />
            {errors.hotelPreferences?.specificHotel && (
              <span className={styles.error}>
                {errors.hotelPreferences.specificHotel.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ferry Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ferry Preferences</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="ferryClass" className={styles.label}>
              Ferry Class
            </label>
            <Controller
              name="ferryPreferences.ferryClass"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select ferry class" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {FERRY_CLASSES.map((cls) => (
                          <Select.Item
                            key={cls.value}
                            value={cls.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{cls.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.ferryPreferences?.ferryClass && (
              <span className={styles.error}>
                {errors.ferryPreferences.ferryClass.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="travelTimeSlot" className={styles.label}>
              Travel Time Slot
            </label>
            <Controller
              name="ferryPreferences.travelTimeSlot"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select time slot" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {TIME_SLOTS.map((slot) => (
                          <Select.Item
                            key={slot.value}
                            value={slot.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{slot.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.ferryPreferences?.travelTimeSlot && (
              <span className={styles.error}>
                {errors.ferryPreferences.travelTimeSlot.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="preferredFerry" className={styles.label}>
              Preferred Ferry (Optional)
            </label>
            <Controller
              name="ferryPreferences.preferredFerry"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select preferred ferry" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {FERRY_COMPANIES.map((company) => (
                          <Select.Item
                            key={company.value}
                            value={company.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{company.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
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

      {/* Add-ons */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Add-ons</h3>
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
            <label htmlFor="mealPreference" className={styles.label}>
              Meal Preference
            </label>
            <Controller
              name="addOns.mealPreference"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select meal preference" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {MEAL_PREFERENCES.map((pref) => (
                          <Select.Item
                            key={pref.value}
                            value={pref.value}
                            className={styles.selectItem}
                          >
                            <Select.ItemText>{pref.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              )}
            />
            {errors.addOns?.mealPreference && (
              <span className={styles.error}>
                {errors.addOns.mealPreference.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label htmlFor="transportation" className={styles.label}>
              Transportation
            </label>
            <Controller
              name="addOns.transportation"
              control={control}
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={styles.selectTrigger}>
                    <Select.Value placeholder="Select transportation" />
                    <Select.Icon>
                      <ChevronDown size={16} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.selectContent}>
                      <Select.Viewport>
                        {TRANSPORTATION_OPTIONS.map((option) => (
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
            {errors.addOns?.transportation && (
              <span className={styles.error}>
                {errors.addOns.transportation.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
