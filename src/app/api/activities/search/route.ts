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

    // Validate required parameters
    if (!activityType || !location) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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

    // Build query - use proper PayloadCMS query format for relationships
    const query = {
      and: [
        {
          "status.isActive": {
            equals: true,
          },
        },
        // Match activities where the category relationship includes the category ID
        {
          "coreInfo.category": {
            contains: categoryId,
          },
        },
        // Find activities where one of the locations matches the requested location
        {
          "coreInfo.location": {
            contains: location,
          },
        },
      ],
    };

    // Search for activities in Payload
    const results = await payload.find({
      collection: "activities",
      where: query as any, // Use type assertion to avoid TypeScript errors
      depth: 2, // Adjust depth as needed for related data
      limit: 20,
    });

    console.log("Results:", results.docs);

    // Return response WITH the CORS headers
    return NextResponse.json(results.docs, { headers });
  } catch (error) {
    console.error("Search API error:", error);
    // Include headers in error response too
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");

    return NextResponse.json(
      { error: "Failed to search activities" },
      { status: 500, headers }
    );
  }
}
