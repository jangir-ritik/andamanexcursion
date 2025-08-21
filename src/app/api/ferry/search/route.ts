import { NextRequest, NextResponse } from "next/server";
import { FerryAggregationService } from "@/services/ferryServices/ferryAggregationService";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    const { from, to, date, adults, children = 0, infants = 0 } = body;

    if (!from || !to || !date || !adults) {
      return NextResponse.json(
        { error: "Missing required parameters: from, to, date, adults" },
        { status: 400 }
      );
    }

    // Validate date format
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if date is in the past (day-only comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Also normalize search date to start of day for comparison
    searchDate.setHours(0, 0, 0, 0);

    if (searchDate < today) {
      return NextResponse.json(
        { error: "Cannot search for dates in the past" },
        { status: 400 }
      );
    }

    const searchParams: FerrySearchParams = {
      from,
      to,
      date,
      adults: parseInt(adults),
      children: parseInt(children),
      infants: parseInt(infants),
    };

    console.log(`🔍 API: Ferry search requested`, searchParams);

    const { results, errors } =
      await FerryAggregationService.searchAllOperators(searchParams);

    // Return results with metadata
    const response = {
      success: true,
      data: {
        results,
        searchParams,
        meta: {
          totalResults: results.length,
          searchTime: new Date().toISOString(),
          operatorErrors: errors,
        },
      },
    };

    console.log(
      `✅ API: Ferry search completed - ${results.length} results found`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ API: Ferry search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to search ferries." },
    { status: 405 }
  );
}
