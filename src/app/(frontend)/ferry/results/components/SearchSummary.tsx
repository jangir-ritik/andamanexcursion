import React from "react";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";
import styles from "./SearchSummary.module.css";

interface SearchSummaryProps {
  loading: boolean;
  ferryCount: number;
  searchParams: FerrySearchParams;
}

export function SearchSummary({
  loading,
  ferryCount,
  searchParams,
}: SearchSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLocation = (location: string) => {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Havelock Island",
      neil: "Neil Island",
      baratang: "Baratang Island",
    };
    return locationMap[location] || location;
  };

  const totalPassengers =
    searchParams.adults + searchParams.children + searchParams.infants;

  return (
    <div className={styles.searchSummary}>
      <div className={styles.routeInfo}>
        <div className={styles.route}>
          <span className={styles.from}>
            {formatLocation(searchParams.from)}
          </span>
          <span className={styles.arrow}>→</span>
          <span className={styles.to}>{formatLocation(searchParams.to)}</span>
        </div>

        <div className={styles.details}>
          <span className={styles.date}>{formatDate(searchParams.date)}</span>
          <span className={styles.passengers}>
            {totalPassengers} passenger{totalPassengers !== 1 ? "s" : ""}
            {searchParams.children > 0 &&
              ` (${searchParams.children} child${
                searchParams.children !== 1 ? "ren" : ""
              })`}
            {searchParams.infants > 0 &&
              ` (${searchParams.infants} infant${
                searchParams.infants !== 1 ? "s" : ""
              })`}
          </span>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        {loading ? (
          <span className={styles.loading}>Searching...</span>
        ) : (
          <span className={styles.count}>
            {ferryCount === 0
              ? "No ferries found"
              : `${ferryCount} ferry option${
                  ferryCount !== 1 ? "s" : ""
                } available`}
          </span>
        )}
      </div>
    </div>
  );
}
