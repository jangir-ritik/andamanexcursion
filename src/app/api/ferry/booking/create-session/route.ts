import { NextRequest, NextResponse } from "next/server";
import {
  FerryBookingSession,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";
import { v4 as uuidv4 } from "uuid";

// In a real application, this would be stored in a database
// For now, we'll use in-memory storage with expiration
let bookingSessions: Map<string, FerryBookingSession>;

// Initialize sessions map
if (typeof global !== "undefined") {
  if (!global.bookingSessions) {
    global.bookingSessions = new Map<string, FerryBookingSession>();

    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, session] of global.bookingSessions?.entries() ||
        []) {
        if (session.expiresAt < now) {
          global.bookingSessions?.delete(sessionId);
          console.log(`🧹 Cleaned up expired booking session: ${sessionId}`);
        }
      }
    }, 5 * 60 * 1000);
  }
  bookingSessions =
    global.bookingSessions || new Map<string, FerryBookingSession>();
} else {
  bookingSessions = new Map<string, FerryBookingSession>();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    const { searchParams, selectedFerry, selectedClass } = body;

    if (!searchParams || !selectedFerry || !selectedClass) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: searchParams, selectedFerry, selectedClass",
        },
        { status: 400 }
      );
    }

    // Create new booking session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const session: FerryBookingSession = {
      sessionId,
      searchParams,
      selectedFerry,
      selectedClass,
      passengers: [],
      totalAmount: selectedClass.price,
      createdAt: new Date(),
      expiresAt,
    };

    // Store session
    bookingSessions.set(sessionId, session);

    console.log(
      `🎫 API: Created booking session ${sessionId} for ferry ${selectedFerry.ferryId}`
    );

    const response = {
      success: true,
      data: {
        sessionId,
        session,
        expiresAt: expiresAt.toISOString(),
        timeRemaining: 30 * 60, // seconds
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ API: Create booking session error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId parameter" },
        { status: 400 }
      );
    }

    const session = bookingSessions.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Booking session not found or expired" },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      bookingSessions.delete(sessionId);
      return NextResponse.json(
        { error: "Booking session expired" },
        { status: 410 }
      );
    }

    const timeRemaining = Math.max(
      0,
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
    );

    const response = {
      success: true,
      data: {
        session,
        timeRemaining,
        isExpired: timeRemaining === 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ API: Get booking session error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve booking session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function for internal use
function getBookingSessions() {
  return typeof global !== "undefined"
    ? global.bookingSessions || bookingSessions
    : bookingSessions;
}
