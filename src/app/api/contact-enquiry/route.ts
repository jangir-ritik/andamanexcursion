import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Type definitions
interface ContactEnquiryRequest {
  booking: {
    package: string;
    duration: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  };
  personal: {
    fullName: string;
    age: number;
    phone: string;
    email: string;
  };
  additional: {
    tags: string[];
    message: string;
  };
  additionalMessage: string;
  enquirySource: string;
  packageInfo?: {
    id?: string;
    title: string;
    slug?: string;
    period: string;
    price: number;
    originalPrice?: number;
    description?: string;
    category?: string;
  };
  timestamp: string;
  recaptchaScore: string;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const xRealIP = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("remote-addr");

  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return xRealIP || remoteAddr || "unknown";
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone
function isValidPhone(phone: string): boolean {
  // Basic phone validation - adjust based on your requirements
  const phoneRegex = /^[\+]?[1-9][\d]{6,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

export async function POST(request: NextRequest) {
  console.log("🔍 Contact enquiry API called");

  try {
    // Log basic request details
    const requestUrl = request.url;
    const requestMethod = request.method;
    const requestHeaders = Object.fromEntries(request.headers.entries());

    console.log("📥 Request details:", {
      url: requestUrl,
      method: requestMethod,
      contentType: requestHeaders["content-type"],
      userAgent: requestHeaders["user-agent"],
    });

    // Parse request body
    const rawBody = await request.text();
    console.log("📄 Raw request body received");

    let body: ContactEnquiryRequest;
    try {
      body = JSON.parse(rawBody);
      console.log("✅ Request body parsed successfully");
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    // Detailed validation logging
    console.log("🔍 Validating fields...");

    if (!body.personal?.fullName?.trim()) {
      console.error("❌ Validation failed: Missing fullName");
      return NextResponse.json(
        { error: "Full name is required", field: "personal.fullName" },
        { status: 400 }
      );
    }

    if (!body.personal?.email?.trim() || !isValidEmail(body.personal.email)) {
      console.error(
        "❌ Validation failed: Invalid email",
        body.personal?.email
      );
      return NextResponse.json(
        { error: "Valid email address is required", field: "personal.email" },
        { status: 400 }
      );
    }

    if (!body.personal?.phone?.trim() || !isValidPhone(body.personal.phone)) {
      console.error(
        "❌ Validation failed: Invalid phone",
        body.personal?.phone
      );
      return NextResponse.json(
        { error: "Valid phone number is required", field: "personal.phone" },
        { status: 400 }
      );
    }

    if (!body.booking?.adults || body.booking.adults < 1) {
      console.error(
        "❌ Validation failed: Invalid adults count",
        body.booking?.adults
      );
      return NextResponse.json(
        { error: "At least 1 adult is required", field: "booking.adults" },
        { status: 400 }
      );
    }

    // Enhanced date validation
    console.log("📅 Validating dates...");
    const checkIn = new Date(body.booking.checkIn);
    const checkOut = new Date(body.booking.checkOut);

    console.log("Date comparison:", {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      checkInValid: !isNaN(checkIn.getTime()),
      checkOutValid: !isNaN(checkOut.getTime()),
    });

    if (isNaN(checkIn.getTime())) {
      console.error("❌ Invalid check-in date:", body.booking.checkIn);
      return NextResponse.json(
        { error: "Invalid check-in date format", field: "booking.checkIn" },
        { status: 400 }
      );
    }

    if (isNaN(checkOut.getTime())) {
      console.error("❌ Invalid check-out date:", body.booking.checkOut);
      return NextResponse.json(
        { error: "Invalid check-out date format", field: "booking.checkOut" },
        { status: 400 }
      );
    }

    // Compare dates only (ignore time) - more practical validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      console.error("❌ Check-in date is before today");
      return NextResponse.json(
        {
          error: "Check-in date cannot be before today",
          field: "booking.checkIn",
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      console.error("❌ Check-out date must be after check-in date");
      return NextResponse.json(
        {
          error: "Check-out date must be after check-in date",
          field: "booking.checkOut",
        },
        { status: 400 }
      );
    }

    console.log("✅ All validations passed, creating enquiry...");

    // Get Payload instance
    let payload;
    try {
      payload = await getPayload({ config });
      console.log("✅ Payload instance obtained");
    } catch (payloadError) {
      console.error("❌ Failed to get Payload instance:", payloadError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Prepare enquiry data with proper tag transformation
    const enquiryData = {
      customerInfo: {
        fullName: body.personal.fullName.trim(),
        email: body.personal.email.trim().toLowerCase(),
        phone: body.personal.phone.trim(),
        age: body.personal.age || 25,
      },
      bookingDetails: {
        selectedPackage: body.booking.package || "",
        duration: body.booking.duration || "",
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: body.booking.adults,
        children: body.booking.children || 0,
        tags: (body.additional.tags || []).map((tag) => ({ tag })), // Transform to correct format
      },
      packageInfo: body.packageInfo
        ? {
            title: body.packageInfo.title,
            price: body.packageInfo.price,
            period: body.packageInfo.period,
            description: body.packageInfo.description,
          }
        : undefined,
      messages: {
        message: body.additional.message?.trim() || "",
        additionalMessage: body.additionalMessage?.trim() || "",
      },
      enquiryMetadata: {
        enquirySource: body.enquirySource || "direct",
        status: "new",
        priority: "medium",
      },
      technicalDetails: {
        userAgent: request.headers.get("user-agent") || "",
        ipAddress: getClientIP(request),
        recaptchaScore: body.recaptchaScore || "not-verified",
        submissionTimestamp: new Date(
          body.timestamp || Date.now()
        ).toISOString(),
      },
    };

    console.log("✅ Enquiry data prepared");

    // Create enquiry in database
    let enquiry;
    try {
      enquiry = await payload.create({
        collection: "enquiries",
        data: enquiryData as any,
      });
      console.log(`✅ Enquiry created successfully: ${enquiry.id}`);
    } catch (createError) {
      console.error("❌ Failed to create enquiry:", createError);
      return NextResponse.json(
        {
          error: "Failed to save enquiry to database",
          details:
            createError instanceof Error
              ? createError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }

    // Calculate estimated response time based on current load
    let estimatedResponseTime = "24 hours";
    try {
      const today = new Date();
      const todayEnquiries = await payload.count({
        collection: "enquiries",
        where: {
          createdAt: {
            greater_than_equal: new Date(
              today.setHours(0, 0, 0, 0)
            ).toISOString(),
          },
        },
      });

      if (todayEnquiries.totalDocs > 10) {
        estimatedResponseTime = "48 hours";
      } else if (todayEnquiries.totalDocs > 5) {
        estimatedResponseTime = "24-36 hours";
      } else {
        estimatedResponseTime = "12-24 hours";
      }
    } catch (countError) {
      console.error("❌ Failed to calculate response time:", countError);
      // Continue with default response time
    }

    // Return success response
    console.log("✅ Returning success response");
    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      enquiryId: enquiry.enquiryId || enquiry.id,
      estimatedResponseTime,
      data: {
        enquiryId: enquiry.enquiryId || enquiry.id,
        submittedAt: enquiry.createdAt,
        status: "new",
      },
    });
  } catch (error) {
    console.error("💥 Unexpected error in contact-enquiry API:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // ALWAYS return a response, even in the catch block
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    },
    { status: 405 }
  );
}
