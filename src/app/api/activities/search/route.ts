// src/app/api/activities/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCachedPayload } from "@/services/payload/base/client";

// Simple per-request cache to avoid repeated category slot fetches
const perRequestCache = new Map<string, any>();

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

    // Find all child categories as well (for hierarchical search)
    const childCategoriesResults = await payload.find({
      collection: "activity-categories",
      where: {
        or: [
          { id: { equals: categoryId } }, // Include the parent category itself
          { parentCategory: { equals: categoryId } }, // Include child categories
        ],
      },
      limit: 50,
    });

    const allCategoryIds = childCategoriesResults.docs.map((cat) => cat.id);

    // Build the where clause conditions
    const conditions: any[] = [
      {
        "coreInfo.category.id": {
          in: allCategoryIds, // Search in parent and child categories
        },
      },
      {
        "status.isActive": { equals: true },
      },
    ];

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

      conditions.push({
        "coreInfo.location.id": {
          in: [locationId],
        },
      });
    }

    // Note: Max capacity filtering removed as per client requirements
    // All activities are available regardless of passenger count

    const whereClause = {
      and: conditions,
    };

    // Search for activities initially
    const activities = await payload.find({
      collection: "activities",
      where: whereClause,
      limit: 50, // Reasonable limit
      sort: "-status.priority",
      depth: 2, // Include related data
    });

    let filteredActivities = activities.docs;

    // Filter activities by time availability using new architecture
    if (time && time !== "") {
      const timeFilteredActivities = [];

      for (const activity of filteredActivities) {
        let isTimeAvailable = false;

        // Check activity's direct time slot relationships (new architecture)
        const activityTimeSlots = activity.scheduling?.useCustomTimeSlots
          ? activity.scheduling?.availableTimeSlots
          : activity.scheduling?.defaultTimeSlots;

        if (activityTimeSlots?.length) {
          // Check if the selected time matches any of the activity's time slots
          isTimeAvailable = activityTimeSlots.some((slot: any) => {
            // Handle both string and object slot types
            if (typeof slot === "string") {
              return slot === time;
            }

            // For objects, check if time falls within the slot range
            if (slot.startTime && slot.endTime) {
              const timeInMinutes = timeToMinutes(time.replace("-", ":"));
              const startMinutes = timeToMinutes(slot.startTime);
              const endMinutes = timeToMinutes(slot.endTime);
              return (
                timeInMinutes >= startMinutes && timeInMinutes <= endMinutes
              );
            }

            // Fallback: match by start time
            return slot.startTime && slot.startTime.replace(":", "-") === time;
          });
        } else {
          // Fall back to category-based time slot checking
          try {
            // Get time slots for all relevant categories (prefetched once per request)
            const cacheKey = `category-slots:${allCategoryIds.join(",")}`;
            let categoryTimeSlots = perRequestCache.get(cacheKey);
            if (!categoryTimeSlots) {
              categoryTimeSlots = await payload.find({
                collection: "activity-time-slots",
                where: {
                  and: [
                    { isActive: { equals: true } },
                    { activityTypes: { in: allCategoryIds } }, // Check all relevant categories
                  ],
                },
                depth: 0,
              });
              perRequestCache.set(cacheKey, categoryTimeSlots);
            }

            if (categoryTimeSlots.docs.length > 0) {
              // Check if the selected time falls within any of the category's time slots
              const timeInMinutes = timeToMinutes(time.replace("-", ":"));

              isTimeAvailable = categoryTimeSlots.docs.some(
                (slot: { startTime: string; endTime: string }) => {
                  const startMinutes = timeToMinutes(slot.startTime);
                  const endMinutes = timeToMinutes(slot.endTime);
                  return (
                    timeInMinutes >= startMinutes && timeInMinutes <= endMinutes
                  );
                }
              );
            } else {
              // No time restrictions for this category, allow all times
              isTimeAvailable = true;
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
