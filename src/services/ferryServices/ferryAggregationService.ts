import {
  FerrySearchParams,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

import { MakruzzService } from "./makruzzService";
import { SealinkService } from "./sealinkService";
import { GreenOceanService } from "./greenOceanService";


export class FerryAggregationService {
  private static async searchSealink(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    try {
      return await SealinkService.searchTrips(params);
    } catch (error) {
      console.error("Error searching Sealink:", error);
      return [];
    }
  }

  private static async searchMakruzz(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    try {
      return await MakruzzService.searchTrips(params);
    } catch (error) {
      console.error("Error searching Makruzz:", error);
      return [];
    }
  }

  private static async searchGreenOcean(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    try {
      return await GreenOceanService.searchTrips(params);
    } catch (error) {
      console.error("Error searching GreenOcean:", error);
      return [];
    }
  }

  public static async searchAllOperators(params: FerrySearchParams): Promise<{
    results: UnifiedFerryResult[];
    errors: { operator: string; error: string }[];
  }> {
    const promises = [
      this.searchSealink(params).catch((error) => ({
        operator: "sealink",
        error: error.message,
      })),
      this.searchMakruzz(params).catch((error) => ({
        operator: "makruzz",
        error: error.message,
      })),
      this.searchGreenOcean(params).catch((error) => ({
        operator: "greenocean",
        error: error.message,
      })),
    ];
    const responses = await Promise.allSettled(promises);
    const results: UnifiedFerryResult[] = [];
    const errors: { operator: string; error: string }[] = [];

    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        if (Array.isArray(response.value)) {
          results.push(...response.value);
        }
      } else {
        errors.push({
          operator: response.reason.operator,
          error: response.reason.error,
        });
      }
    });

    // Sort results by departure time
    results.sort((a, b) =>
      a.schedule.departureTime.localeCompare(b.schedule.departureTime)
    );
    return {
      results,
      errors,
    };
  }
}
