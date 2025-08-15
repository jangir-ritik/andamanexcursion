// src/app/api/activities/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCachedPayload } from "@/services/payload/base/client";

export async function GET(request: NextRequest) {
  try {
    // Set CORS headers
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*"); // For development
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS preflight request
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers });
    }

    // Rest of your existing code...
    const searchParams = request.nextUrl.searchParams;
    const activityType = searchParams.get("activityType");
    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const adults = parseInt(searchParams.get("adults") || "0", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);

    console.log("Search params:", {
      activityType,
      location,
      date,
      time,
      adults,
      children,
    });

    // Validate required parameters - only activityType is required
    if (!activityType) {
      return NextResponse.json(
        { error: "Missing required parameter: activityType" },
        { status: 400 }
      );
    }

    // Get payload instance
    const payload = await getCachedPayload();

    // First, find the category by slug to get its ID
    const categoryResults = await payload.find({
      collection: "activity-categories",
      where: {
        slug: {
          equals: activityType,
        },
      },
      limit: 1,
    });

    const categoryId = categoryResults.docs[0]?.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404, headers }
      );
    }

    // Build the where clause for activities
    const whereClause: any = {
      "coreInfo.category": {
        in: [categoryId],
      },
      "status.isActive": { equals: true },
    };

    // Add location filter only if provided
    if (location) {
      // Find the location by slug to get its ID
      const locationResults = await payload.find({
        collection: "locations",
        where: {
          slug: {
            equals: location,
          },
        },
        limit: 1,
      });

      const locationId = locationResults.docs[0]?.id;

      if (!locationId) {
        return NextResponse.json(
          { error: "Location not found" },
          { status: 404, headers }
        );
      }

      whereClause["coreInfo.location"] = {
        in: [locationId],
      };
    }

    // Add capacity filter based on total passengers
    const totalPassengers = adults + children;
    if (totalPassengers > 0) {
      whereClause["coreInfo.maxCapacity"] = {
        greater_than_equal: totalPassengers,
      };
    }

    // Search for activities initially
    const activities = await payload.find({
      collection: "activities",
      where: whereClause,
      limit: 50, // Reasonable limit
      sort: "-status.priority",
      depth: 2, // Include related data
    });

    let filteredActivities = activities.docs;

    // If time slot is specified, filter activities based on time availability
    if (time && time !== "") {
      console.log("Filtering activities by time slot:", time);

      const timeFilteredActivities = [];

      for (const activity of filteredActivities) {
        let isTimeAvailable = false;

        // Check if activity has custom time slots
        if (
          activity.scheduling?.useCustomTimeSlots &&
          activity.scheduling?.availableTimeSlots?.length
        ) {
          // Check if the selected time matches any of the activity's custom time slots
          const customSlots = activity.scheduling.availableTimeSlots;
          isTimeAvailable = customSlots.some((slot) => {
            // Handle both string and object slot types
            if (typeof slot === "string") {
              return slot === time;
            }
            // Match by time comparison for ActivityTimeSlot objects
            return slot.startTime && slot.startTime.replace(":", "-") === time;
          });
        } else {
          // Fall back to category-based time slot checking
          try {
            // Get time slots for this category
            const categoryTimeSlots = await payload.find({
              collection: "activity-time-slots",
              where: {
                activityCategory: {
                  equals: categoryId,
                },
                isActive: {
                  equals: true,
                },
              },
              depth: 1,
            });

            if (categoryTimeSlots.docs.length > 0) {
              // Check if the selected time falls within any of the category's time slots
              const timeInMinutes = timeToMinutes(time.replace("-", ":"));

              isTimeAvailable = categoryTimeSlots.docs.some((slot) => {
                const startMinutes = timeToMinutes(slot.startTime);
                const endMinutes = timeToMinutes(slot.endTime);
                return (
                  timeInMinutes >= startMinutes && timeInMinutes <= endMinutes
                );
              });

              console.log(
                `Activity ${activity.title} - Category slots check:`,
                {
                  selectedTime: time,
                  selectedTimeMinutes: timeInMinutes,
                  categorySlots: categoryTimeSlots.docs.map((s) => ({
                    startTime: s.startTime,
                    endTime: s.endTime,
                    startMinutes: timeToMinutes(s.startTime),
                    endMinutes: timeToMinutes(s.endTime),
                  })),
                  isAvailable: isTimeAvailable,
                }
              );
            } else {
              // No time restrictions for this category, allow all times
              isTimeAvailable = true;
              console.log(
                `Activity ${activity.title} - No time restrictions, allowing all times`
              );
            }
          } catch (error) {
            console.error(
              `Error checking time slots for activity ${activity.title}:`,
              error
            );
            // In case of error, include the activity (fail open)
            isTimeAvailable = true;
          }
        }

        if (isTimeAvailable) {
          timeFilteredActivities.push(activity);
        }
      }

      filteredActivities = timeFilteredActivities;
      console.log(
        `Time filtering complete: ${filteredActivities.length} activities available at ${time}`
      );
    }

    return NextResponse.json(filteredActivities, { headers });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to convert time string (HH:mm) to minutes
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}
