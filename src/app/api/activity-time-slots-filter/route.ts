import { NextRequest, NextResponse } from "next/server";
import { getCachedPayload } from "@/services/payload/base/client";

/**
 * GET /api/activity-time-slots-filter
 * Get activity time slots with optional filtering
 * (Custom endpoint to avoid conflicts with Payload's auto-generated collection routes)
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getCachedPayload();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");
    const timeSlotIds = searchParams.get("timeSlotIds");

    let result;

    if (timeSlotIds) {
      // Get specific time slots by IDs
      const ids = timeSlotIds.split(",").filter(Boolean);
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          and: [{ isActive: { equals: true } }, { id: { in: ids } }],
        },
        sort: "sortOrder",
        depth: 2,
      });
    } else if (categorySlug) {
      // Get time slots for specific category
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          and: [
            { isActive: { equals: true } },
            { "activityTypes.slug": { equals: categorySlug } },
          ],
        },
        sort: "sortOrder",
        depth: 2,
      });
    } else {
      // Get all active time slots
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          isActive: { equals: true },
        },
        sort: "sortOrder",
        depth: 2,
      });
    }

    return NextResponse.json({
      success: true,
      data: result.docs,
      count: result.docs.length,
    });
  } catch (error) {
    console.error("Error fetching activity time slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activity time slots",
      },
      { status: 500 }
    );
  }
}
