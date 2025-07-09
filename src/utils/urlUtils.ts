/**
 * Builds URL search parameters for booking forms in a consistent format
 * @param params Object containing booking parameters
 * @returns URL search parameters string
 */
export function buildBookingUrlParams(params: {
  from?: string;
  to?: string;
  activity?: string;
  location?: string;
  date: string;
  time: string;
  passengers: number;
  [key: string]: any;
}): string {
  // Start with required parameters
  const urlParams = new URLSearchParams();

  // Add date, time and passengers (common to all booking types)
  urlParams.set("date", params.date);
  urlParams.set("time", params.time);
  urlParams.set("passengers", params.passengers.toString());

  // Add type-specific parameters
  if (params.from) urlParams.set("from", params.from);
  if (params.to) urlParams.set("to", params.to);
  if (params.activity) urlParams.set("activity", params.activity);
  if (params.location) urlParams.set("location", params.location);

  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (
      ![
        "from",
        "to",
        "activity",
        "location",
        "date",
        "time",
        "passengers",
      ].includes(key)
    ) {
      urlParams.set(key, value.toString());
    }
  });

  return urlParams.toString();
}
