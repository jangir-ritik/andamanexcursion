import { NextResponse } from "next/server";
import { contactFormOptionsService } from "@/services/contact-form-options.service";

/**
 * API route to fetch contact form dropdown options
 * GET /api/contact-form-options
 */
export async function GET() {
  try {
    const options = await contactFormOptionsService.getAllOptions();

    return NextResponse.json(options, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("API Error fetching contact form options:", error);

    return NextResponse.json(
      {
        packages: [],
        periods: [],
        categories: [],
        isLoading: false,
        error: "Failed to fetch contact form options",
      },
      { status: 500 }
    );
  }
}
