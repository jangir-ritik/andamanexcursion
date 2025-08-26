"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import styles from "../UnifiedSearchingForm.module.css";
import { cn } from "@/utils/cn";

import {
  Button,
  DateSelect,
  SlotSelect,
  LocationSelect,
  PassengerCounter,
  FerryStatusIndicator,
} from "@/components/atoms";
import { LocationMappingService } from "@/services/ferryServices/locationMappingService";

// Ferry search schema
const ferrySearchSchema = z.object({
  fromLocation: z.string().min(1, "Please select departure location"),
  toLocation: z.string().min(1, "Please select destination"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().optional(), // Time slot is optional for ferries
  passengers: z.object({
    adults: z
      .number()
      .min(1, "At least 1 adult required")
      .max(10, "Maximum 10 adults"),
    children: z.number().min(0).max(10, "Maximum 10 children"),
    infants: z.number().min(0).max(5, "Maximum 5 infants"),
  }),
});

type FerrySearchFormData = z.infer<typeof ferrySearchSchema>;

interface FerrySearchFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

// Use centralized location mapping
const FERRY_LOCATIONS = LocationMappingService.getFormLocations();

// Ferry time slots
const FERRY_TIME_SLOTS = [
  {
    value: "06:00",
    label: "06:00 AM",
    id: "06:00",
    time: "06:00",
    slug: "06:00",
  },
  {
    value: "07:00",
    label: "07:00 AM",
    id: "07:00",
    time: "07:00",
    slug: "07:00",
  },
  {
    value: "08:00",
    label: "08:00 AM",
    id: "08:00",
    time: "08:00",
    slug: "08:00",
  },
  {
    value: "09:00",
    label: "09:00 AM",
    id: "09:00",
    time: "09:00",
    slug: "09:00",
  },
  {
    value: "10:00",
    label: "10:00 AM",
    id: "10:00",
    time: "10:00",
    slug: "10:00",
  },
  {
    value: "11:00",
    label: "11:00 AM",
    id: "11:00",
    time: "11:00",
    slug: "11:00",
  },
  {
    value: "12:00",
    label: "12:00 PM",
    id: "12:00",
    time: "12:00",
    slug: "12:00",
  },
  {
    value: "13:00",
    label: "01:00 PM",
    id: "13:00",
    time: "13:00",
    slug: "13:00",
  },
  {
    value: "14:00",
    label: "02:00 PM",
    id: "14:00",
    time: "14:00",
    slug: "14:00",
  },
  {
    value: "15:00",
    label: "03:00 PM",
    id: "15:00",
    time: "15:00",
    slug: "15:00",
  },
  {
    value: "16:00",
    label: "04:00 PM",
    id: "16:00",
    time: "16:00",
    slug: "16:00",
  },
  {
    value: "17:00",
    label: "05:00 PM",
    id: "17:00",
    time: "17:00",
    slug: "17:00",
  },
];

export function FerrySearchForm({
  className,
  variant = "default",
}: FerrySearchFormProps) {
  const router = useRouter();
  const {
    searchParams,
    isLoading,
    error,
    setSearchParams,
    searchFerries,
    clearError,
  } = useFerryStore();

  // Memoize default values to prevent recreating on each render
  const defaultValues = useMemo(
    () => ({
      fromLocation: searchParams.from || "",
      toLocation: searchParams.to || "",
      selectedDate: searchParams.date
        ? new Date(searchParams.date)
        : new Date(),
      selectedSlot: "", // Ferry time slots will be based on available schedules
      passengers: {
        adults: searchParams.adults || 2,
        children: searchParams.children || 0,
        infants: searchParams.infants || 0,
      },
    }),
    [searchParams]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<FerrySearchFormData>({
    resolver: zodResolver(ferrySearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Watch from and to locations to prevent same selection
  const fromLocation = watch("fromLocation");
  const toLocation = watch("toLocation");

  // Filter destination options based on selected departure
  const availableDestinations = useMemo(() => {
    return FERRY_LOCATIONS.filter(
      (location) => location.value !== fromLocation
    );
  }, [fromLocation]);

  // Filter departure options based on selected destination
  const availableDepartures = useMemo(() => {
    return FERRY_LOCATIONS.filter((location) => location.value !== toLocation);
  }, [toLocation]);

  // Memoize the submit handler
  const onSubmit = useCallback(
    async (data: FerrySearchFormData) => {
      // Clear any existing errors
      clearError();

      // Validate that from and to are different
      if (data.fromLocation === data.toLocation) {
        setError("toLocation", {
          type: "manual",
          message: "Destination must be different from departure location",
        });
        return;
      }

      // Convert form data to search params format
      // Use local date to avoid timezone conversion issues
      const localDate = new Date(
        data.selectedDate.getTime() -
          data.selectedDate.getTimezoneOffset() * 60000
      );
      const searchParams = {
        from: data.fromLocation,
        to: data.toLocation,
        date: localDate.toISOString().split("T")[0], // YYYY-MM-DD format (local timezone)
        adults: data.passengers.adults,
        children: data.passengers.children,
        infants: data.passengers.infants,
      };

      // Update search params in store
      setSearchParams(searchParams);

      // Search for ferries
      await searchFerries();

      // Navigate to results page
      const urlParams = new URLSearchParams({
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date,
        adults: searchParams.adults.toString(),
        children: searchParams.children.toString(),
        infants: searchParams.infants.toString(),
      });

      router.push(`/ferry/results?${urlParams.toString()}`);
    },
    [setSearchParams, searchFerries, setError, router, clearError]
  );

  // Memoize button text based on variant
  const buttonText = useMemo(() => {
    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return "Find Ferries";
      default:
        return "Search";
    }
  }, [variant]);

  // Memoize passenger handler to prevent recreation on each render
  const handlePassengerChange = useCallback(
    (field: any) => (type: string, value: number) => {
      field.onChange({
        ...field.value,
        [type]: value,
      });
    },
    []
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Ferry Search Form"
      role="form"
      aria-describedby="ferry-search-form-description"
      aria-required="true"
      aria-invalid={Object.keys(errors).length > 0 ? "true" : "false"}
      aria-busy={isSubmitting || isLoading ? "true" : "false"}
      aria-live="polite"
      className={cn(styles.formGrid, className)}
    >
      <div className={styles.formContent}>
        {/* From Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="fromLocation"
            render={({ field }) => (
              <LocationSelect
                label="From"
                value={field.value}
                onChange={field.onChange}
                options={availableDepartures}
                placeholder="Departure Port"
                hasError={!!errors.fromLocation}
              />
            )}
          />
          {errors.fromLocation && (
            <div className={styles.errorMessage}>
              {errors.fromLocation.message}
            </div>
          )}
        </div>

        {/* To Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="toLocation"
            render={({ field }) => (
              <LocationSelect
                label="To"
                value={field.value}
                onChange={field.onChange}
                options={availableDestinations}
                placeholder="Destination Port"
                hasError={!!errors.toLocation}
              />
            )}
          />
          {errors.toLocation && (
            <div className={styles.errorMessage}>
              {errors.toLocation.message}
            </div>
          )}
        </div>

        {/* Date */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedDate"
            render={({ field }) => (
              <DateSelect
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                hasError={!!errors.selectedDate}
                // minDate={new Date()} // Ferry bookings only for future dates
              />
            )}
          />
          {errors.selectedDate && (
            <div className={styles.errorMessage}>
              {errors.selectedDate.message}
            </div>
          )}
        </div>

        {/* Time Slot - Optional for ferry since schedules vary by operator */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedSlot"
            render={({ field }) => (
              <SlotSelect
                value={field.value || ""}
                onChange={field.onChange}
                options={FERRY_TIME_SLOTS}
                placeholder="Preferred Time"
                hasError={!!errors.selectedSlot}
              />
            )}
          />
          {errors.selectedSlot && (
            <div className={styles.errorMessage}>
              {errors.selectedSlot.message}
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="passengers"
            render={({ field }) => (
              <PassengerCounter
                value={field.value}
                onChange={handlePassengerChange(field)}
                hasError={!!errors.passengers}
              />
            )}
          />
          {errors.passengers && (
            <div className={styles.errorMessage}>
              {errors.passengers.message}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            className={styles.searchButton}
            showArrow
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? "Searching..." : buttonText}
          </Button>
        </div>
      </div>

      {/* Error Display with API Status Context */}
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>

          {/* Show ferry API status to provide context */}
          {/* <div className={styles.apiStatusContainer}>
            <span className={styles.apiStatusLabel}>Ferry API Status:</span>
            <FerryStatusIndicator
              variant="compact"
              showLabels={true}
              className={styles.apiStatusIndicator}
            />
          </div> */}
        </div>
      )}

      {/* Always show API status in development mode */}
      {/* {process.env.NODE_ENV === "development" && !error && (
        <div className={styles.devStatusContainer}>
          <span className={styles.devStatusLabel}>API Status:</span>
          <FerryStatusIndicator
            variant="compact"
            showLabels={true}
            className={styles.devStatusIndicator}
          />
        </div>
      )} */}
    </form>
  );
}
