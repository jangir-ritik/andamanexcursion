//src/app/api/ferry/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { FerryAggregationService } from "@/services/ferryServices/ferryAggregationService";
import { z } from "zod";
import { validateApiAccess } from "@/middleware/ferryApiSecurity";

// Request validation schema
const searchRequestSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  adults: z.number().min(1).max(10),
  children: z.number().min(0).max(10),
  infants: z.number().min(0).max(5),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting middleware
    const rateLimitCheck = validateApiAccess("ferry-search");
    rateLimitCheck(request);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = searchRequestSchema.parse(body);

    // Call ferry aggregation service
    const { results, errors } =
      await FerryAggregationService.searchAllOperators(validatedData);

    // Return results with any operator errors
    return NextResponse.json({
      results,
      errors,
      searchParams: validatedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ferry search API error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle rate limiting errors
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to search ferries",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
