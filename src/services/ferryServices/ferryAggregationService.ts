import {
  FerrySearchParams,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

import { MakruzzService } from "./makruzzService";
import { SealinkService } from "./sealinkService";
import { GreenOceanService } from "./greenOceanService";

interface OperatorResult {
  operator: string;
  results?: UnifiedFerryResult[];
  error?: string;
}

export class FerryAggregationService {
  private static async searchSealink(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      // Check if credentials are available
      if (!process.env.SEALINK_USERNAME || !process.env.SEALINK_TOKEN) {
        return {
          operator: "sealink",
          error: "Sealink credentials not configured",
        };
      }

      const results = await SealinkService.searchTrips(params);
      return { operator: "sealink", results };
    } catch (error) {
      console.error("Error searching Sealink:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("JSON")) {
          return {
            operator: "sealink",
            error:
              "Sealink API returned invalid response (possibly down or maintenance)",
          };
        }
        if (error.message.includes("timeout")) {
          return {
            operator: "sealink",
            error: "Sealink API timeout - service may be slow",
          };
        }
        if (error.message.includes("401") || error.message.includes("403")) {
          return {
            operator: "sealink",
            error: "Sealink authentication failed - check credentials",
          };
        }
      }

      return {
        operator: "sealink",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static async searchMakruzz(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      // Check if credentials are available
      if (!process.env.MAKRUZZ_USERNAME || !process.env.MAKRUZZ_PASSWORD) {
        return {
          operator: "makruzz",
          error: "Makruzz credentials not configured",
        };
      }

      const results = await MakruzzService.searchTrips(params);
      return { operator: "makruzz", results };
    } catch (error) {
      console.error("Error searching Makruzz:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("JSON")) {
          return {
            operator: "makruzz",
            error:
              "Makruzz API returned invalid response (possibly down or maintenance)",
          };
        }
        if (error.message.includes("timeout")) {
          return {
            operator: "makruzz",
            error: "Makruzz API timeout - service may be slow",
          };
        }
        if (error.message.includes("401") || error.message.includes("403")) {
          return {
            operator: "makruzz",
            error: "Makruzz authentication failed - check credentials",
          };
        }
      }

      return {
        operator: "makruzz",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static async searchGreenOcean(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      // Check if credentials are available
      if (
        !process.env.GREEN_OCEAN_PUBLIC_KEY ||
        !process.env.GREEN_OCEAN_PRIVATE_KEY
      ) {
        return {
          operator: "greenocean",
          error: "Green Ocean credentials not configured",
        };
      }

      const results = await GreenOceanService.searchTrips(params);
      return { operator: "greenocean", results };
    } catch (error) {
      console.error("Error searching Green Ocean:", error);
      return {
        operator: "greenocean",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public static async searchAllOperators(params: FerrySearchParams): Promise<{
    results: UnifiedFerryResult[];
    errors: { operator: string; error: string }[];
  }> {
    // Execute all searches in parallel
    const [sealinkResult, makruzzResult, greenOceanResult] = await Promise.all([
      this.searchSealink(params),
      this.searchMakruzz(params),
      this.searchGreenOcean(params),
    ]);

    const results: UnifiedFerryResult[] = [];
    const errors: { operator: string; error: string }[] = [];

    // Process results
    [sealinkResult, makruzzResult, greenOceanResult].forEach(
      (operatorResult) => {
        if (operatorResult.results) {
          results.push(...operatorResult.results);
        } else if (operatorResult.error) {
          errors.push({
            operator: operatorResult.operator,
            error: operatorResult.error,
          });
        }
      }
    );

    // Sort results by departure time
    results.sort((a, b) =>
      a.schedule.departureTime.localeCompare(b.schedule.departureTime)
    );

    return {
      results,
      errors,
    };
  }

  // API Health Check Methods
  public static async checkOperatorHealth(): Promise<{
    sealink: { status: "online" | "offline" | "error"; message?: string };
    makruzz: { status: "online" | "offline" | "error"; message?: string };
    greenocean: { status: "online" | "offline" | "error"; message?: string };
  }> {
    const healthChecks = await Promise.allSettled([
      this.checkSealinkHealth(),
      this.checkMakruzzHealth(),
      this.checkGreenOceanHealth(),
    ]);

    return {
      sealink:
        healthChecks[0].status === "fulfilled"
          ? healthChecks[0].value
          : { status: "error", message: "Health check failed" },
      makruzz:
        healthChecks[1].status === "fulfilled"
          ? healthChecks[1].value
          : { status: "error", message: "Health check failed" },
      greenocean:
        healthChecks[2].status === "fulfilled"
          ? healthChecks[2].value
          : { status: "error", message: "Health check failed" },
    };
  }

  private static async checkSealinkHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (!process.env.SEALINK_USERNAME || !process.env.SEALINK_TOKEN) {
        return { status: "offline", message: "Credentials not configured" };
      }

      const response = await fetch(
        `${process.env.SEALINK_API_URL}getTripData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleDateString("en-GB"),
            from: "Port Blair",
            to: "Swaraj Dweep",
            userName: process.env.SEALINK_USERNAME,
            token: process.env.SEALINK_TOKEN,
          }),
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      return response.ok
        ? { status: "online" }
        : { status: "error", message: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  private static async checkMakruzzHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (!process.env.MAKRUZZ_USERNAME || !process.env.MAKRUZZ_PASSWORD) {
        return { status: "offline", message: "Credentials not configured" };
      }

      const response = await fetch(`${process.env.MAKRUZZ_API_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            username: process.env.MAKRUZZ_USERNAME,
            password: process.env.MAKRUZZ_PASSWORD,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      return response.ok
        ? { status: "online" }
        : { status: "error", message: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  private static async checkGreenOceanHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (
        !process.env.GREEN_OCEAN_PUBLIC_KEY ||
        !process.env.GREEN_OCEAN_PRIVATE_KEY
      ) {
        return { status: "offline", message: "Credentials not configured" };
      }

      // Simple ping to check if the API is reachable
      const response = await fetch(
        `${process.env.GREEN_OCEAN_API_URL}route-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_id: 1,
            dest_to: 2,
            number_of_adults: 1,
            number_of_infants: 0,
            travel_date: new Date().toLocaleDateString("en-GB"),
            public_key: process.env.GREEN_OCEAN_PUBLIC_KEY,
            hash_string: "test", // Invalid hash for health check
          }),
          signal: AbortSignal.timeout(5000),
        }
      );

      // Even if auth fails, if we get a response, API is online
      return { status: "online" };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }
}
