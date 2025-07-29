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
    const infants = parseInt(searchParams.get("infants") || "0", 10);

    console.log("Search params:", {
      activityType,
      location,
      date,
      time,
      adults,
      children,
      infants,
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
    const totalPassengers = adults + children + infants;
    if (totalPassengers > 0) {
      whereClause["coreInfo.maxCapacity"] = {
        greater_than_equal: totalPassengers,
      };
    }

    // Search for activities
    const activities = await payload.find({
      collection: "activities",
      where: whereClause,
      limit: 50, // Reasonable limit
      sort: "-status.priority",
      depth: 2, // Include related data
    });

    return NextResponse.json(activities.docs, { headers });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
