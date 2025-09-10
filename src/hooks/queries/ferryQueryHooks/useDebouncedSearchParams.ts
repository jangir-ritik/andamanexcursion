// hooks/ferrySearch/useDebouncedSearchParams.ts
import { useEffect, useState } from "react";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";

export const useDebouncedSearchParams = (
  searchParams: FerrySearchParams,
  delay: number = 1000
) => {
  const [debouncedParams, setDebouncedParams] = useState(searchParams);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if the params are actually valid for searching
      const isValid = !!(
        searchParams.from &&
        searchParams.to &&
        searchParams.date &&
        searchParams.from !== searchParams.to &&
        searchParams.adults > 0
      );

      if (isValid) {
        setDebouncedParams(searchParams);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [searchParams, delay]);

  return debouncedParams;
};
