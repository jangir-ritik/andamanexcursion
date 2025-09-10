// components/organisms/FerrySearchForm.tsx
"use client";
import React, { useCallback, useMemo, useEffect } from "react";
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
} from "@/components/atoms";
import { LocationMappingService } from "@/services/ferryServices/locationMappingService";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";
import { FerrySearchErrorBoundary } from "@/components/ferry/ErrorBoundary/FerrySearchErrorBoundary";

// Ferry search schema
const ferrySearchSchema = z.object({
  fromLocation: z.string().min(1, "Please select departure location"),
  toLocation: z.string().min(1, "Please select destination location"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().optional(), // This is now UI-only
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
  enableReactiveSearch?: boolean; // NEW: Control reactive behavior
  showManualSearch?: boolean; // NEW: Show search button even in reactive mode
}

const FERRY_LOCATIONS = LocationMappingService.getFormLocations();

const FERRY_TIME_SLOTS = [
  {
    value: "", // Empty string represents "no preference"
    label: "All Times",
    id: "all-times",
    time: "",
    slug: "all-times",
  },
  {
    value: "06:00",
    label: "Morning",
    id: "06:00",
    time: "06:00",
    slug: "06:00",
  },
  {
    value: "12:00",
    label: "Noon",
    id: "12:00",
    time: "12:00",
    slug: "12:00",
  },
  {
    value: "18:00",
    label: "Evening",
    id: "18:00",
    time: "18:00",
    slug: "18:00",
  },
];

export function FerrySearchForm({
  className,
  variant = "default",
  enableReactiveSearch = false,
  showManualSearch = true,
}: FerrySearchFormProps) {
  const router = useRouter();
  const { searchParams, setSearchParams, setPreferredTime } = useFerryStore();

  const {
    isSearching,
    searchError,
    searchErrors,
    operatorHealth,
    refetchSearch,
    hasSearchParamsChanged,
  } = useFerryFlow({
    enableReactiveSearch,
    debounceMs: 1500, // 1.5 second debounce
  });

  const defaultValues = useMemo(
    () => ({
      fromLocation: searchParams.from || "",
      toLocation: searchParams.to || "",
      selectedDate: searchParams.date
        ? new Date(searchParams.date)
        : new Date(),
      selectedSlot: "",
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
    mode: "onChange", // Changed from "onSubmit" to "onChange" for reactive updates
  });

  // Watch all fields for reactive updates
  const watchedFields = watch();

  const availableDestinations = useMemo(() => {
    return FERRY_LOCATIONS.filter(
      (location) => location.value !== watchedFields.fromLocation
    );
  }, [watchedFields.fromLocation]);

  const availableDepartures = useMemo(() => {
    return FERRY_LOCATIONS.filter(
      (location) => location.value !== watchedFields.toLocation
    );
  }, [watchedFields.toLocation]);

  // Use reactive search as configured
  const shouldEnableReactiveSearch = enableReactiveSearch;

  // Reactive search params update
  useEffect(() => {
    if (!shouldEnableReactiveSearch) return;

    const { fromLocation, toLocation, selectedDate, passengers } =
      watchedFields;

    if (fromLocation && toLocation && selectedDate && passengers) {
      // Basic validation before updating search params
      if (fromLocation === toLocation) return;
      if (passengers.adults < 1) return;

      const localDate = new Date(selectedDate);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const newSearchParams = {
        from: fromLocation,
        to: toLocation,
        date: formattedDate,
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
        // NOTE: No timing parameter sent to API
      };

      // Only update if params actually changed
      const hasChanged =
        JSON.stringify(newSearchParams) !== JSON.stringify(searchParams);
      if (hasChanged) {
        setSearchParams(newSearchParams);
      }
    }
  }, [
    watchedFields.fromLocation,
    watchedFields.toLocation,
    watchedFields.selectedDate,
    watchedFields.passengers,
    shouldEnableReactiveSearch,
    searchParams,
    setSearchParams,
  ]);

  // NEW: Handle timing separately - this affects filtering, not search
  useEffect(() => {
    const { selectedSlot } = watchedFields;

    // Convert form timing to filter format
    let timeFilter: string | null = null;
    if (selectedSlot && selectedSlot !== "") {
      // Map form timing to filter timing
      switch (selectedSlot) {
        case "06:00":
          timeFilter = "0600-1200"; // Morning
          break;
        case "12:00":
          timeFilter = "1200-1800"; // Afternoon
          break;
        case "18:00":
          timeFilter = "1800-2359"; // Evening
          break;
        default:
          timeFilter = null;
      }
    }
    // Update preferred time in store (this will affect result filtering)
    setPreferredTime(timeFilter);
  }, [watchedFields.selectedSlot, setPreferredTime]);

  // Simplified system availability check
  const isSystemAvailable = useMemo(() => {
    if (!operatorHealth) return true;

    const allOffline = Object.values(operatorHealth).every(
      (status: any) => status.status === "offline" || status.status === "error"
    );

    return !allOffline;
  }, [operatorHealth]);

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      !!watchedFields.fromLocation &&
      !!watchedFields.toLocation &&
      !!watchedFields.selectedDate &&
      watchedFields.passengers?.adults > 0 &&
      watchedFields.fromLocation !== watchedFields.toLocation
    );
  }, [watchedFields]);

  const onSubmit = useCallback(
    async (data: FerrySearchFormData) => {
      if (data.fromLocation === data.toLocation) {
        setError("toLocation", {
          type: "manual",
          message: "Destination must be different from departure location",
        });
        return;
      }

      // Format date properly
      const localDate = new Date(data.selectedDate);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const searchParams = {
        from: data.fromLocation,
        to: data.toLocation,
        date: formattedDate,
        adults: data.passengers.adults,
        children: data.passengers.children,
        infants: data.passengers.infants,
      };

      // Update store
      setSearchParams(searchParams);

      // Navigate to results only if not already on results page
      if (!window.location.pathname.includes("/ferry/results")) {
        const urlParams = new URLSearchParams({
          from: searchParams.from,
          to: searchParams.to,
          date: searchParams.date,
          adults: searchParams.adults.toString(),
          children: searchParams.children.toString(),
          infants: searchParams.infants.toString(),
        });

        router.push(`/ferry/results?${urlParams.toString()}`);
      }
    },
    [setSearchParams, setError, router]
  );

  const buttonText = useMemo(() => {
    if (enableReactiveSearch && !showManualSearch) {
      return null; // Hide button in pure reactive mode
    }

    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return enableReactiveSearch ? "Update Search" : "Find Ferries";
      default:
        return "Search Ferries";
    }
  }, [variant, enableReactiveSearch, showManualSearch]);

  const handlePassengerChange = useCallback(
    (field: { value: any; onChange: (value: any) => void }) =>
      (type: string, value: number) => {
        field.onChange({
          ...field.value,
          [type]: value,
        });
      },
    []
  );

  const isLoading = isSubmitting || isSearching;
  const isSearchDisabled = !isSystemAvailable || !isFormValid || isLoading;

  return (
    <FerrySearchErrorBoundary>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Ferry Search Form"
        className={cn(styles.formGrid, className)}
      >
        <div className={styles.formContent}>
          {/* Reactive search indicator */}
          {/* {enableReactiveSearch && hasSearchParamsChanged && (
          <div className={styles.reactiveIndicator}>
            Searching automatically as you type...
          </div>
        )} */}

          <div className={styles.formField}>
            <Controller
              control={control}
              name="fromLocation"
              render={({ field }) => (
                <LocationSelect
                  label="From"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={availableDepartures}
                  placeholder="Departure Port"
                  hasError={!!errors.fromLocation}
                  errorMessage={errors.fromLocation?.message}
                  // disabled={isLoading && !enableReactiveSearch}
                />
              )}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              control={control}
              name="toLocation"
              render={({ field }) => (
                <LocationSelect
                  label="To"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={availableDestinations}
                  placeholder="Destination Port"
                  hasError={!!errors.toLocation}
                  errorMessage={errors.toLocation?.message}
                  // disabled={isLoading && !enableReactiveSearch}
                />
              )}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              control={control}
              name="selectedDate"
              render={({ field }) => (
                <DateSelect
                  selected={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.selectedDate}
                  // disabled={isLoading && !enableReactiveSearch}
                />
              )}
            />
            {errors.selectedDate && (
              <div className={styles.errorMessage}>
                {errors.selectedDate.message}
              </div>
            )}
          </div>

          <div className={styles.formField}>
            <Controller
              control={control}
              name="selectedSlot"
              render={({ field }) => (
                <SlotSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={FERRY_TIME_SLOTS}
                  placeholder="Preferred Time (Optional)"
                  hasError={!!errors.selectedSlot}
                  label="Preferred Timing"
                  optional={true}
                  disabled={isLoading && !enableReactiveSearch}
                  // NOTE: This doesn't affect the search API call
                />
              )}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              control={control}
              name="passengers"
              render={({ field }) => (
                <PassengerCounter
                  value={field.value}
                  onChange={handlePassengerChange(field)}
                  hasError={!!errors.passengers}
                  // disabled={isLoading && !enableReactiveSearch}
                />
              )}
            />
            {errors.passengers && (
              <div className={styles.errorMessage}>
                {errors.passengers.message}
              </div>
            )}
          </div>

          {buttonText && (
            <div className={styles.buttonContainer}>
              <Button
                variant="primary"
                className={styles.searchButton}
                showArrow
                type="submit"
                disabled={isSearchDisabled}
              >
                {isLoading ? "Searching..." : buttonText}
              </Button>
            </div>
          )}
        </div>
      </form>
    </FerrySearchErrorBoundary>
  );
}
