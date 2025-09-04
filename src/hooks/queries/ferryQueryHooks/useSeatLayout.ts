import { GreenOceanService } from "@/services/ferryServices/greenOceanService";
import { SealinkService } from "@/services/ferryServices/sealinkService";
import { useQuery } from "@tanstack/react-query";

export const useSeatLayout = (
  operator: string,
  ferryId: string | null,
  classId: string | null,
  routeId?: number | null,
  travelDate?: string | null
) => {
  return useQuery({
    queryKey: ["seat-layout", operator, ferryId, classId, routeId, travelDate],
    queryFn: async () => {
      if (!ferryId || !classId)
        throw new Error("Ferry ID and Class ID are required");

      switch (operator.toLowerCase()) {
        case "greenocean":
          if (!routeId || !travelDate)
            throw new Error("Green Ocean requires routeId and travelDate");
          return GreenOceanService.getSeatLayout(
            routeId,
            parseInt(ferryId),
            parseInt(classId),
            travelDate
          );

        case "sealink":
          return SealinkService.getSeatLayout(
            ferryId, 
            classId, 
            travelDate || ""
          );

        case "makruzz":
          throw new Error("Makruzz does not support seat selection");

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    },
    enabled: !!(operator && ferryId && classId && operator !== "makruzz"),
    staleTime: 10 * 60 * 1000, // 10 minutes - seat layouts change less frequently
    gcTime: 15 * 60 * 1000,
    retry: 1, // Only retry once for seat layouts
    throwOnError: false,
  });
};
