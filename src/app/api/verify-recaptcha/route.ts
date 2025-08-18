import { NextRequest, NextResponse } from "next/server";

interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { token, action = "submit" } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return NextResponse.json(
        { success: false, error: "reCAPTCHA not configured" },
        { status: 500 }
      );
    }

    // Verify token with Google
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: request.headers.get("x-forwarded-for") || "unknown",
        }),
      }
    );

    const verificationResult: RecaptchaVerificationResponse =
      await verificationResponse.json();

    // Check verification success
    if (!verificationResult.success) {
      console.error(
        "reCAPTCHA verification failed:",
        verificationResult["error-codes"]
      );
      return NextResponse.json(
        {
          success: false,
          error: "reCAPTCHA verification failed",
          details: verificationResult["error-codes"],
        },
        { status: 400 }
      );
    }

    // Check score (0.0 = bot, 1.0 = human)
    const score = verificationResult.score || 0;
    const threshold = 0.5; // Adjust based on your needs

    if (score < threshold) {
      console.warn(`Low reCAPTCHA score: ${score} for action: ${action}`);
      return NextResponse.json(
        {
          success: false,
          error: "Security verification failed",
          score,
          threshold,
        },
        { status: 403 }
      );
    }

    // Verify action matches
    if (verificationResult.action !== action) {
      console.warn(
        `Action mismatch: expected ${action}, got ${verificationResult.action}`
      );
    }

    return NextResponse.json({
      success: true,
      score,
      action: verificationResult.action,
      message: "reCAPTCHA verification successful",
    });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
