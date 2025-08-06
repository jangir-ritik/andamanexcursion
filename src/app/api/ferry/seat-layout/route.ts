import { NextRequest, NextResponse } from "next/server";
import { GreenOceanService } from "@/services/ferryServices/greenOceanService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    const { routeId, ferryId, classId, travelDate, operator, forceRefresh } =
      body;

    if (!routeId || !ferryId || !classId || !travelDate) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: routeId, ferryId, classId, travelDate",
        },
        { status: 400 }
      );
    }

    // Only Green Ocean supports seat selection for now
    if (operator !== "greenocean") {
      return NextResponse.json(
        { error: "Seat layout only available for Green Ocean ferries" },
        { status: 400 }
      );
    }

    console.log(
      `🪑 API: Fetching seat layout for ferry ${ferryId}, class ${classId}${
        forceRefresh ? " (force refresh)" : ""
      }`
    );

    const seatLayout = await GreenOceanService.getSeatLayout(
      parseInt(routeId),
      parseInt(ferryId),
      parseInt(classId),
      travelDate,
      forceRefresh
    );

    const response = {
      success: true,
      data: {
        seatLayout,
        meta: {
          routeId: parseInt(routeId),
          ferryId: parseInt(ferryId),
          classId: parseInt(classId),
          travelDate,
          fetchedAt: new Date().toISOString(),
        },
      },
    };

    console.log(
      `✅ API: Seat layout fetched - ${seatLayout.seats.length} seats`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ API: Seat layout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch seat layout",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to get seat layout." },
    { status: 405 }
  );
}
