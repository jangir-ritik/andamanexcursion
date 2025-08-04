import { NextResponse } from "next/server";
import { FerryAggregationService } from "@/services/ferryServices/ferryAggregationService";

export async function GET() {
  try {
    const healthStatus = await FerryAggregationService.checkOperatorHealth();

    return NextResponse.json({
      operators: healthStatus,
      timestamp: new Date().toISOString(),
      overallStatus: Object.values(healthStatus).every(
        (op) => op.status === "online"
      )
        ? "all_online"
        : Object.values(healthStatus).some((op) => op.status === "online")
        ? "partial_online"
        : "all_offline",
    });
  } catch (error) {
    console.error("Ferry health check failed:", error);

    return NextResponse.json(
      {
        operators: {
          sealink: { status: "error", message: "Health check failed" },
          makruzz: { status: "error", message: "Health check failed" },
          greenocean: { status: "error", message: "Health check failed" },
        },
        timestamp: new Date().toISOString(),
        overallStatus: "all_offline",
        error: "Health check service unavailable",
      },
      { status: 503 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
