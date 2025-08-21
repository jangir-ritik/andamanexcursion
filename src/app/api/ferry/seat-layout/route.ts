import { NextRequest, NextResponse } from "next/server";
import { GreenOceanService } from "@/services/ferryServices/greenOceanService";
import { SealinkService } from "@/services/ferryServices/sealinkService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate required parameters
    const { routeId, ferryId, classId, travelDate, operator, forceRefresh } =
      body;

    // Debug: Log the incoming request
    console.log(`🪑 API: Incoming seat layout request:`, {
      operator,
      ferryId,
      classId,
      routeId,
      travelDate,
      forceRefresh,
    });

    // Validate required parameters based on operator
    if (!ferryId || !classId || !travelDate || !operator) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: ferryId, classId, travelDate, operator",
        },
        { status: 400 }
      );
    }

    // Green Ocean requires routeId, but other operators don't
    if (operator === "greenocean" && !routeId) {
      return NextResponse.json(
        {
          error: "Missing required parameter for Green Ocean: routeId",
        },
        { status: 400 }
      );
    }

    console.log(
      `🪑 API: Fetching seat layout for ${operator} ferry ${ferryId}, class ${classId}${
        forceRefresh ? " (force refresh)" : ""
      }`
    );

    let seatLayout;
    let meta: any;

    switch (operator) {
      case "greenocean":
        seatLayout = await GreenOceanService.getSeatLayout(
          parseInt(routeId),
          parseInt(ferryId),
          parseInt(classId),
          travelDate,
          forceRefresh
        );
        meta = {
          routeId: parseInt(routeId),
          ferryId: parseInt(ferryId),
          classId: parseInt(classId),
          travelDate,
          operator,
          fetchedAt: new Date().toISOString(),
        };
        break;

      case "sealink":
        seatLayout = await SealinkService.getSeatLayout(
          ferryId, // Sealink uses string IDs - don't parse as integer
          classId,
          travelDate
        );
        meta = {
          routeId: routeId || null,
          ferryId: ferryId, // Keep as string for Sealink
          classId: classId,
          travelDate,
          operator,
          fetchedAt: new Date().toISOString(),
        };
        break;

      case "makruzz":
        return NextResponse.json(
          {
            error:
              "Makruzz uses auto-assignment only, no seat selection available",
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          { error: `Seat layout not supported for operator: ${operator}` },
          { status: 400 }
        );
    }

    const response = {
      success: true,
      data: {
        seatLayout,
        meta,
      },
    };

    console.log(
      `✅ API: Seat layout fetched - ${seatLayout.seats.length} seats for ${operator} ferry ${ferryId}`
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
