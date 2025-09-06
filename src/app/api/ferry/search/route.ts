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

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

    // ✅ ENHANCED: This now handles partial failures gracefully
    const { results, errors } =
      await FerryAggregationService.searchAllOperators(searchParams);

    // ✅ Determine response status based on results and errors
    let responseStatus = 200;
    let responseMessage = "success";

    if (results.length === 0 && errors.length > 0) {
      // No results and all operators failed
      responseStatus = 207; // Multi-Status (partial content)
      responseMessage =
        "All ferry operators are temporarily unavailable. Please try again later.";
    } else if (errors.length > 0) {
      // Some results but some operators failed
      responseStatus = 207; // Multi-Status (partial content)
      responseMessage =
        "Some ferry operators are temporarily unavailable, but we found results from available services.";
    }

    const response = {
      success: results.length > 0, // Success if we have any results
      message: responseMessage,
      data: {
        results,
        searchParams,
        meta: {
          totalResults: results.length,
          searchTime: new Date().toISOString(),
          operatorErrors: errors,
          availableOperators: ["sealink", "makruzz", "greenocean"].filter(
            (op) => !errors.some((error) => error.operator === op)
          ),
          failedOperators: errors.map((error) => error.operator),
        },
      },
    };

    console.log(
      `✅ API: Ferry search completed - ${results.length} results found, ${errors.length} operator errors`
    );

    return NextResponse.json(response, { status: responseStatus });
  } catch (error) {
    console.error("❌ API: Ferry search critical error:", error);

    // ✅ ENHANCED: More detailed error response
    return NextResponse.json(
      {
        success: false,
        error: "Ferry search service temporarily unavailable",
        message:
          "We're experiencing technical difficulties. Please try again in a few minutes.",
        details:
          process.env.NODE_ENV === "development"
            ? {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 503 } // Service Unavailable
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to search ferries." },
    { status: 405 }
  );
}
