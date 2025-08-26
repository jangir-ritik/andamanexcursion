import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const locationSlug = searchParams.get("location");

    // Validate required parameters
    if (!categorySlug || !locationSlug) {
      return NextResponse.json(
        {
          error: "Both category and location parameters are required",
          message: "Please provide both category and location slugs",
        },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: configPromise });

    // Query activities matching the category and location
    const activities = await payload.find({
      collection: "activities",
      where: {
        and: [
          {
            "coreInfo.category.slug": {
              equals: categorySlug,
            },
          },
          {
            "coreInfo.location.slug": {
              equals: locationSlug,
            },
          },
          {
            "status.isActive": {
              equals: true,
            },
          },
        ],
      },
      limit: 100,
    });

    // Extract unique time slots from matching activities
    const timeSlotSet = new Set<string>();
    const timeSlotDetails = new Map<string, any>();

    activities.docs.forEach((activity: any) => {
      // Check for time slots in coreInfo.defaultTimeSlots
      const defaultTimeSlots = activity.coreInfo?.defaultTimeSlots;

      if (defaultTimeSlots && Array.isArray(defaultTimeSlots)) {
        defaultTimeSlots.forEach((slot: any) => {
          if (slot.startTime && slot.endTime) {
            const slotKey = slot.startTime.replace(":", "-");
            timeSlotSet.add(slotKey);
            if (!timeSlotDetails.has(slotKey)) {
              timeSlotDetails.set(slotKey, {
                value: slotKey,
                label:
                  slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
            }
          }
        });
      }
    });

    // Convert to array and sort by start time
    const timeSlots = Array.from(timeSlotSet)
      .map((key) => timeSlotDetails.get(key))
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by start time
        const timeA = a.startTime.replace(":", "");
        const timeB = b.startTime.replace(":", "");
        return parseInt(timeA) - parseInt(timeB);
      });

    return NextResponse.json({
      timeSlots,
      meta: {
        categorySlug,
        locationSlug,
        activitiesFound: activities.docs.length,
        uniqueTimeSlots: timeSlots.length,
      },
    });
  } catch (error) {
    console.error("Error fetching available times:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch available times",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
