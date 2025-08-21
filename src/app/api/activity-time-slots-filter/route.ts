import { NextRequest, NextResponse } from "next/server";
import { getCachedPayload } from "@/services/payload/base/client";

/**
 * GET /api/activity-time-slots-filter
 * Get activity time slots with optional filtering
 * (Custom endpoint to avoid conflicts with Payload's auto-generated collection routes)
 */
// Simple in-memory cache with TTL to reduce DB load
type CacheEntry = { data: any; expiresAt: number };
const CACHE: Map<string, CacheEntry> = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCache(key: string) {
  const entry = CACHE.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) CACHE.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  CACHE.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

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
      const cacheKey = `ids:${ids.sort().join(",")}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          count: cached.length,
        });
      }
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          and: [{ isActive: { equals: true } }, { id: { in: ids } }],
        },
        sort: "sortOrder",
        depth: 2,
      });
      setCache(cacheKey, result.docs);
    } else if (categorySlug) {
      // Get time slots for specific category
      const cacheKey = `category:${categorySlug}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          count: cached.length,
        });
      }
      // Since we removed activityTypes relationship, we'll return all active time slots
      // The frontend will filter them based on activity's defaultTimeSlots
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          isActive: { equals: true },
        },
        sort: "sortOrder",
        depth: 2,
      });
      setCache(cacheKey, result.docs);
    } else {
      // Get all active time slots
      const cacheKey = `all`;
      const cached = getCache(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          count: cached.length,
        });
      }
      result = await payload.find({
        collection: "activity-time-slots",
        where: {
          isActive: { equals: true },
        },
        sort: "sortOrder",
        depth: 2,
      });
      setCache(cacheKey, result.docs);
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
