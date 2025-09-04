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
import { useFerryFlow } from "@/hooks/queries/useFerryStore";

// Ferry search schema
const ferrySearchSchema = z.object({
  fromLocation: z.string().min(1, "Please select departure location"),
  toLocation: z.string().min(1, "Please select destination location"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().optional(),
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

interface OperatorStatus {
  status: "online" | "offline" | "error";
  lastChecked?: string;
  responseTime?: number;
}

interface OperatorHealth {
  [operator: string]: OperatorStatus;
}

interface FerrySearchFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

const FERRY_LOCATIONS = LocationMappingService.getFormLocations();

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
  const { searchParams, setSearchParams } = useFerryStore();

  const {
    isSearching,
    searchError,
    searchErrors,
    operatorHealth,
    isSearchEnabled,
  } = useFerryFlow();

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
    mode: "onSubmit",
  });

  // Watch specific fields to avoid excessive re-renders
  const watchedFields = watch([
    "fromLocation",
    "toLocation",
    "selectedDate",
    "passengers",
  ]);
  const [fromLocation, toLocation, selectedDate, passengers] = watchedFields;

  const availableDestinations = useMemo(() => {
    return FERRY_LOCATIONS.filter(
      (location) => location.value !== fromLocation
    );
  }, [fromLocation]);

  const availableDepartures = useMemo(() => {
    return FERRY_LOCATIONS.filter((location) => location.value !== toLocation);
  }, [toLocation]);

  const onSubmit = useCallback(
    async (data: FerrySearchFormData) => {
      if (data.fromLocation === data.toLocation) {
        setError("toLocation", {
          type: "manual",
          message: "Destination must be different from departure location",
        });
        return;
      }

      // Ensure proper date formatting in local timezone
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

      // Update Zustand store
      setSearchParams(searchParams);

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
    [setSearchParams, setError, router]
  );

  const buttonText = useMemo(() => {
    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return "Find Ferries";
      default:
        return "Search Ferries";
    }
  }, [variant]);

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

  const displayError = useMemo(() => {
    if (searchError) {
      return searchError.message || "Search failed. Please try again.";
    }

    if (searchErrors.length > 0) {
      const failedOperators = searchErrors
        .map((e: { operator: string; error: string }) => e.operator)
        .join(", ");
      return `Some ferry operators are unavailable (${failedOperators}). Results may be limited.`;
    }

    return null;
  }, [searchError, searchErrors]);

  // Only disable if ALL operators are offline/error
  const isSearchDisabled = useMemo(() => {
    if (!operatorHealth) return false;

    const allOffline = Object.values(operatorHealth as OperatorHealth).every(
      (status) => status.status === "offline" || status.status === "error"
    );

    console.log("Health check - operatorHealth:", operatorHealth);
    console.log("Health check - allOffline:", allOffline);
    console.log("Health check - isSearchDisabled:", allOffline);

    return allOffline;
  }, [operatorHealth]);

  // Form validation using already watched fields
  const isFormValid = useMemo(() => {
    return (
      !!fromLocation &&
      !!toLocation &&
      !!selectedDate &&
      passengers?.adults > 0 &&
      fromLocation !== toLocation
    );
  }, [fromLocation, toLocation, selectedDate, passengers]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Ferry Search Form"
      className={cn(styles.formGrid, className)}
    >
      <div className={styles.formContent}>
        <div className={styles.formField}>
          <Controller
            control={control}
            name="fromLocation"
            render={({ field }) => (
              <LocationSelect
                label="From"
                value={field.value || ""}
                onChange={(value) => {
                  field.onChange(value);
                }}
                options={availableDepartures}
                placeholder="Departure Port"
                hasError={!!errors.fromLocation}
                errorMessage={errors.fromLocation?.message}
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
                onChange={(value) => {
                  field.onChange(value);
                }}
                options={availableDestinations}
                placeholder="Destination Port"
                hasError={!!errors.toLocation}
                errorMessage={errors.toLocation?.message}
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
                onChange={(date) => field.onChange(date)}
                hasError={!!errors.selectedDate}
                // disabled={isLoading}
                // minDate={new Date()}
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
                disabled={isLoading}
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
                // disabled={isLoading}
              />
            )}
          />
          {errors.passengers && (
            <div className={styles.errorMessage}>
              {errors.passengers.message}
            </div>
          )}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            className={styles.searchButton}
            showArrow
            type="submit"
            disabled={isLoading || isSearchDisabled || !isFormValid}
            // title={
            //   isSearchDisabled
            //     ? "All ferry operators are currently unavailable"
            //     : !isFormValid
            //     ? "Please fill in all required fields"
            //     : undefined
            // }
          >
            {isLoading ? "Searching..." : buttonText}
          </Button>
        </div>
      </div>

      {displayError && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{displayError}</div>
          {/* 
          {operatorHealth && (
            <div className={styles.apiStatusContainer}>
              <span className={styles.apiStatusLabel}>Operator Status:</span>
              <div className={styles.operatorStatusGrid}>
                {Object.entries(operatorHealth as OperatorHealth).map(
                  ([operator, status]) => (
                    <div
                      key={operator}
                      className={cn(
                        styles.operatorStatus,
                        status.status === "online"
                          ? styles.healthy
                          : styles.unhealthy
                      )}
                    >
                      <span className={styles.operatorName}>
                        {operator.charAt(0).toUpperCase() + operator.slice(1)}
                      </span>
                      <span
                        className={cn(
                          styles.statusIndicator,
                          status.status === "online"
                            ? styles.online
                            : styles.offline
                        )}
                      >
                        {status.status === "online" ? "●" : "●"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )} */}
        </div>
      )}

      {searchErrors.length > 0 && searchErrors.length < 3 && (
        <div className={styles.warningContainer}>
          <div className={styles.warningMessage}>
            ⚠️ Limited results: {searchErrors.length} operator(s) temporarily
            unavailable
          </div>
        </div>
      )}

      {/* {process.env.NODE_ENV === "development" &&
        !displayError &&
        operatorHealth && (
          <div className={styles.devStatusContainer}>
            <span className={styles.devStatusLabel}>Dev - API Status:</span>
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
