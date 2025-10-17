// src/app/api/payments/phonepe/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { phonePeService } from "@/services/payments/phonePeService";
import { getPayload } from "payload";
import config from "@payload-config";
import NotificationManager from "@/services/notifications/NotificationManager";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const merchantTransactionId = searchParams.get("merchantTransactionId");

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, error: "Merchant Transaction ID is required" },
        { status: 400 }
      );
    }

    console.log(
      "Checking payment status for transaction:",
      merchantTransactionId
    );

    // Check payment status with PhonePe
    const statusResponse = await phonePeService.checkPaymentStatus(
      merchantTransactionId
    );

    console.log("PhonePe status response:", {
      merchantTransactionId,
      state: statusResponse.state,
      transactionId: statusResponse.transactionId,
    });

    // Get payment record from database
    const payload = await getPayload({ config });
    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        "phonepeData.merchantOrderId": { equals: merchantTransactionId },
      },
      limit: 1,
    });

    if (!paymentRecords.docs || paymentRecords.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentRecord = paymentRecords.docs[0];

    // Debug: Log payment record structure
    console.log("Payment record found:", {
      id: paymentRecord.id,
      hasBookingData: !!paymentRecord.bookingData,
      bookingDataType: typeof paymentRecord.bookingData,
    });

    // Parse bookingData if it's a string
    let bookingData: any = paymentRecord.bookingData;
    if (typeof bookingData === "string") {
      try {
        bookingData = JSON.parse(bookingData);
        console.log("Parsed bookingData from string");
      } catch (e) {
        console.error("Failed to parse bookingData:", e);
      }
    }

    if (!bookingData) {
      console.error("No booking data found in payment record");
      return NextResponse.json(
        { success: false, error: "Booking data not found in payment record" },
        { status: 400 }
      );
    }

    console.log("Booking data retrieved:", {
      bookingType: bookingData.bookingType,
      hasItems: !!bookingData.items,
      itemsLength: bookingData.items?.length,
      hasContactDetails: !!bookingData.contactDetails,
      hasMembers: !!bookingData.members,
    });

    // Update payment record with status
    // Get existing phonepeData and merge with new data to avoid conflicts
    const existingPhonepeData = (paymentRecord as any).phonepeData || {};

    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status:
          statusResponse.state === "COMPLETED"
            ? "success"
            : statusResponse.state === "FAILED"
            ? "failed"
            : "pending",
        phonepeData: {
          ...existingPhonepeData,
          phonepeTransactionId: statusResponse.transactionId,
          statusCheckData: JSON.stringify(statusResponse),
        },
      },
    });

    // If payment is successful, process the booking
    if (statusResponse.state === "COMPLETED") {
      console.log("Payment successful, processing booking...");

      try {
        // Process booking based on type
        const bookingResult = await processBooking(
          bookingData,
          merchantTransactionId,
          paymentRecord.id
        );

        // Send confirmation notifications (skip for now, can be enabled later)
        // if (bookingResult.success) {
        //   await NotificationManager.sendBookingConfirmation(...);
        // }

        return NextResponse.json({
          success: true,
          status: statusResponse.state,
          transactionId: statusResponse.transactionId,
          booking: bookingResult.booking,
          providerBooking: bookingResult.providerBooking || null,
          message: bookingResult.success
            ? "Payment successful and booking confirmed"
            : "Payment successful but booking needs manual processing",
        });
      } catch (bookingError: any) {
        console.error("Booking processing error:", bookingError);

        // Payment succeeded but booking failed - create failed booking record
        const failedBooking = await createFailedBookingRecord(
          payload,
          bookingData,
          merchantTransactionId,
          paymentRecord.id,
          bookingError
        );

        // Determine user-friendly error message and details based on error type
        const { userMessage, errorType, requiresRefund } = categorizeBookingError(
          bookingError.message,
          bookingData.bookingType
        );

        console.error("⚠️ POST-PAYMENT BOOKING FAILURE:", {
          errorType,
          requiresRefund,
          transactionId: statusResponse.transactionId,
          bookingId: failedBooking.id,
          errorMessage: bookingError.message,
        });

        return NextResponse.json({
          success: false,
          status: statusResponse.state,
          transactionId: statusResponse.transactionId,
          booking: failedBooking,
          error: "Booking processing failed",
          errorType,
          requiresRefund,
          details: bookingError.message,
          message: userMessage,
        });
      }
    }

    // Payment not successful yet
    return NextResponse.json({
      success: false,
      status: statusResponse.state,
      transactionId: statusResponse.transactionId,
      message:
        statusResponse.state === "FAILED"
          ? "Payment failed. Please try again."
          : "Payment is still processing...",
    });
  } catch (error: any) {
    console.error("PhonePe status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Status check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to process booking based on type
async function processBooking(
  bookingData: any,
  orderId: string,
  paymentId: string
) {
  const payload = await getPayload({ config });

  // Determine booking type
  const bookingType = bookingData.bookingType;
  const items = bookingData.items || [];

  if (bookingType === "ferry" && items.length > 0) {
    // Process ferry booking with external API
    const ferryItem = items[0];

    console.log("Ferry item structure:", {
      hasId: !!ferryItem.id,
      hasFerryId: !!ferryItem.ferryId,
      hasFerry: !!ferryItem.ferry,
      ferryKeys: Object.keys(ferryItem.ferry || {}),
      itemKeys: Object.keys(ferryItem),
      ferryItem: JSON.stringify(ferryItem, null, 2),
    });

    const ferryId =
      ferryItem.ferryId || ferryItem.ferry?.ferryId || ferryItem.ferry?.id;

    if (!ferryId) {
      console.error("Ferry ID extraction failed:", { ferryItem });
      throw new Error("Ferry ID not found in booking data");
    }

    console.log("Extracted ferry ID:", ferryId);

    // Extract operator from ferry data
    const operator = ferryItem.ferry.operator as
      | "sealink"
      | "makruzz"
      | "greenocean";

    // Count passengers
    const adults = ferryItem.passengers?.adults || 1;
    const children = ferryItem.passengers?.children || 0;
    const infants = ferryItem.passengers?.infants || 0;

    // Build FerryBookingRequest object
    const bookingRequest = {
      operator: operator,
      ferryId: ferryId,
      fromLocation: ferryItem.ferry.route.from.name,
      toLocation: ferryItem.ferry.route.to.name,
      date: ferryItem.date,
      time: ferryItem.time,
      classId: ferryItem.selectedClass?.id || ferryItem.ferry.selectedClass?.id,
      routeId: ferryItem.ferry.operatorFerryId?.toString(),
      passengers: {
        adults,
        children,
        infants,
      },
      selectedSeats: ferryItem.selectedSeats || [],
      passengerDetails: bookingData.members.map((member: any) => ({
        fullName: member.fullName,
        age: member.age,
        gender: member.gender,
        nationality: member.nationality,
        passportNumber: member.passportNumber,
        whatsappNumber: bookingData.contactDetails?.whatsapp || member.whatsapp,
        phoneCountryCode: member.phoneCountryCode || "+91",
        phoneCountry: member.phoneCountry || "India",
        email: bookingData.contactDetails?.email || member.email,
        fpassport: member.fpassport,
        fexpdate: member.fexpdate,
        fcountry: member.fcountry,
      })),
      paymentReference: orderId,
      totalAmount: ferryItem.price,
    };

    console.log("Booking request prepared:", {
      operator: bookingRequest.operator,
      ferryId: bookingRequest.ferryId,
      passengers: bookingRequest.passengers,
      passengerCount: bookingRequest.passengerDetails.length,
    });

    // Call ferry booking service with proper request object
    const ferryBookingResult = await FerryBookingService.bookFerry(
      bookingRequest
    );

    // Determine booking status based on provider booking result
    // Use "pending" when payment succeeded but provider booking failed (needs manual processing)
    const bookingStatus = ferryBookingResult.success ? "confirmed" : "pending";
    const providerBookingStatus = ferryBookingResult.success
      ? "confirmed"
      : "failed";

    // Create booking record with full details (matching old Razorpay implementation)
    const booking = await payload.create({
      collection: "bookings",
      depth: 2, // Populate relationships
      data: {
        bookingType: "ferry",
        serviceDate: ferryItem.date,
        customerInfo: {
          primaryContactName:
            bookingData.contactDetails?.primaryName ||
            bookingData.members?.[0]?.fullName ||
            "",
          customerEmail: bookingData.contactDetails?.email || "",
          customerPhone: bookingData.contactDetails?.whatsapp || "",
          nationality: bookingData.nationality || "Indian",
        },

        // Ferry booking details
        bookedFerries: [
          {
            operator: ferryItem.ferry.operator as
              | "sealink"
              | "makruzz"
              | "greenocean",
            ferryName:
              ferryItem.ferry?.ferryName || ferryItem.title || "Unknown Ferry",
            route: {
              from:
                ferryItem.ferry?.route?.from?.name ||
                ferryItem.ferry?.fromLocation ||
                "Unknown",
              to:
                ferryItem.ferry?.route?.to?.name ||
                ferryItem.ferry?.toLocation ||
                "Unknown",
              fromCode:
                ferryItem.ferry?.route?.from?.code ||
                ferryItem.ferry?.route?.fromCode ||
                "",
              toCode:
                ferryItem.ferry?.route?.to?.code ||
                ferryItem.ferry?.route?.toCode ||
                "",
            },
            schedule: {
              departureTime:
                ferryItem.ferry?.schedule?.departureTime ||
                ferryItem.time ||
                "Unknown",
              arrivalTime: ferryItem.ferry?.schedule?.arrivalTime || "Unknown",
              duration: ferryItem.ferry?.schedule?.duration || "Unknown",
              travelDate: new Date(ferryItem.date).toISOString(),
            },
            selectedClass: {
              classId:
                ferryItem.selectedClass?.id ||
                ferryItem.ferry?.selectedClass?.id ||
                "unknown",
              className:
                ferryItem.selectedClass?.name ||
                ferryItem.ferry?.selectedClass?.name ||
                "Unknown Class",
              price:
                ferryItem.selectedClass?.price ||
                ferryItem.ferry?.selectedClass?.price ||
                0,
            },
            passengers: {
              adults: ferryItem.passengers?.adults || 0,
              children: ferryItem.passengers?.children || 0,
              infants: ferryItem.passengers?.infants || 0,
            },
            selectedSeats: (ferryItem.selectedSeats || []).map((seat: any) => ({
              seatNumber:
                seat.number || seat.seatNumber || seat || "Auto-assigned",
              seatId: seat.id || seat.seatId || "",
              passengerName: "",
            })),
            providerBooking: {
              pnr: ferryBookingResult.pnr || "",
              operatorBookingId: ferryBookingResult.providerBookingId || "",
              bookingStatus: providerBookingStatus,
              providerResponse: JSON.stringify(ferryBookingResult),
              errorMessage: ferryBookingResult.success
                ? ""
                : ferryBookingResult.error || "Booking failed",
            },
            totalPrice: ferryItem.price || 0,
          },
        ],

        // Passenger details
        passengers: (bookingData.members || []).map(
          (member: any, memberIndex: number) => ({
            isPrimary: memberIndex === 0,
            fullName: member.fullName,
            age: member.age,
            gender: member.gender,
            nationality: member.nationality || "Indian",
            passportNumber: member.passportNumber || "",
            passportExpiry: member.fexpdate || member.passportExpiry || "",
            whatsappNumber:
              memberIndex === 0
                ? bookingData.contactDetails?.whatsapp || member.whatsappNumber
                : member.whatsappNumber,
            email:
              memberIndex === 0
                ? bookingData.contactDetails?.email || member.email
                : member.email,
            assignedActivities: [],
          })
        ),

        // Pricing details
        pricing: {
          subtotal: ferryItem.price,
          taxes: 0,
          fees: 0,
          totalAmount: ferryItem.price,
          currency: "INR",
        },

        status: bookingStatus,
        paymentStatus: "paid",
        paymentTransactions: [paymentId],
        termsAccepted: true,
        communicationPreferences: {
          sendWhatsAppUpdates: true,
          sendEmailUpdates: true,
          language: "en",
        },
      },
    });

    console.log("Ferry booking created successfully:", {
      id: booking.id,
      bookedFerries: booking.bookedFerries?.length,
      passengers: booking.passengers?.length,
      pricing: booking.pricing,
    });

    console.log(
      "Full ferry booking object being returned:",
      JSON.stringify(
        {
          bookedFerries: booking.bookedFerries,
          passengers: booking.passengers,
          pricing: booking.pricing,
          customerInfo: booking.customerInfo,
        },
        null,
        2
      )
    );

    return {
      success: ferryBookingResult.success,
      booking: booking,
      providerBooking: ferryBookingResult,
    };
  } else {
    // For activity/boat bookings - create booking record with full details
    const firstItem = items[0] || {};

    // Process activities for booking
    const bookedActivities =
      bookingType === "activity" && items.length > 0
        ? items.map((item: any) => {
            console.log("Processing activity item for booking:", {
              price: item.price,
              time: item.time,
              passengers: item.passengers,
              searchParams: item.searchParams,
            });

            return {
              activity: item.activity?.id || null,
              activityOption: item.searchParams?.activityType || "",
              quantity: 1,
              unitPrice: item.price || 0,
              totalPrice: item.price || 0,
              scheduledTime: item.time || "",
              location: item.location?.id || null,
              passengers: {
                adults: item.passengers?.adults || 0,
                children: 0,
                infants: 0,
              },
            };
          })
        : [];

    console.log("Processed bookedActivities:", bookedActivities);

    // Process boats for booking
    const bookedBoats =
      bookingType === "boat" && firstItem
        ? [
            {
              boatRoute: firstItem.boat?.id || null,
              boatName:
                firstItem.boat?.name || firstItem.title || "Unknown Boat",
              route: {
                from:
                  firstItem.boat?.route?.from ||
                  firstItem.location ||
                  "Unknown",
                to: firstItem.boat?.route?.to || "Unknown",
              },
              schedule: {
                departureTime:
                  firstItem.selectedTime || firstItem.time || "Unknown",
                duration:
                  firstItem.boat?.route?.minTimeAllowed ||
                  firstItem.boat?.minTimeAllowed ||
                  "Unknown",
                travelDate: new Date(
                  firstItem.date || new Date()
                ).toISOString(),
              },
              passengers: {
                adults: firstItem.passengers?.adults || 0,
                children: 0,
                infants: 0,
              },
              totalPrice: firstItem.price || 0,
            },
          ]
        : [];

    console.log("Creating booking with data:", {
      bookingType,
      customerInfo: {
        primaryContactName:
          bookingData.contactDetails?.primaryName ||
          bookingData.members?.[0]?.fullName ||
          "",
        customerEmail: bookingData.contactDetails?.email || "",
      },
      bookedActivitiesCount: bookedActivities.length,
      passengersCount: (bookingData.members || []).length,
      pricing: {
        subtotal: bookingData.totalPrice || firstItem.price || 0,
        totalAmount: bookingData.totalPrice || firstItem.price || 0,
      },
    });

    const booking = await payload.create({
      collection: "bookings",
      depth: 2, // Populate relationships
      data: {
        bookingType: bookingType,
        serviceDate: firstItem.date || new Date().toISOString().split("T")[0],
        customerInfo: {
          primaryContactName:
            bookingData.contactDetails?.primaryName ||
            bookingData.members?.[0]?.fullName ||
            "",
          customerEmail: bookingData.contactDetails?.email || "",
          customerPhone: bookingData.contactDetails?.whatsapp || "",
          nationality: bookingData.nationality || "Indian",
        },

        bookedActivities: bookedActivities,
        bookedBoats: bookedBoats,

        // Passenger details
        passengers: (bookingData.members || []).map(
          (member: any, memberIndex: number) => ({
            isPrimary: memberIndex === 0,
            fullName: member.fullName,
            age: member.age,
            gender: member.gender,
            nationality: member.nationality || "Indian",
            passportNumber: member.passportNumber || "",
            passportExpiry: member.fexpdate || member.passportExpiry || "",
            whatsappNumber:
              memberIndex === 0
                ? bookingData.contactDetails?.whatsapp || member.whatsappNumber
                : member.whatsappNumber,
            email:
              memberIndex === 0
                ? bookingData.contactDetails?.email || member.email
                : member.email,
            assignedActivities:
              bookingType === "activity"
                ? items.map((item: any, itemIndex: number) => ({
                    activityIndex: itemIndex,
                  }))
                : [],
          })
        ),

        pricing: {
          subtotal: bookingData.totalPrice || firstItem.price || 0,
          taxes: 0,
          fees: 0,
          totalAmount: bookingData.totalPrice || firstItem.price || 0,
          currency: "INR",
        },

        status: "confirmed",
        paymentStatus: "paid",
        paymentTransactions: [paymentId],
        termsAccepted: true,
        communicationPreferences: {
          sendWhatsAppUpdates: true,
          sendEmailUpdates: true,
          language: "en",
        },
      },
    });

    console.log("Booking created successfully:", {
      id: booking.id,
      bookedActivities: booking.bookedActivities?.length,
      passengers: booking.passengers?.length,
      pricing: booking.pricing,
    });

    console.log(
      "Full booking object being returned:",
      JSON.stringify(
        {
          bookedActivities: booking.bookedActivities,
          passengers: booking.passengers,
          pricing: booking.pricing,
          customerInfo: booking.customerInfo,
        },
        null,
        2
      )
    );

    return {
      success: true,
      booking: booking,
    };
  }
}

// Helper function to create failed booking record
async function createFailedBookingRecord(
  payload: any,
  bookingData: any,
  orderId: string,
  paymentId: string,
  error: any
) {
  return await payload.create({
    collection: "bookings",
    data: {
      bookingId: orderId,
      confirmationNumber: orderId,
      status: "failed",
      bookingType: bookingData.bookingType,
      bookingData: bookingData,
      paymentId: paymentId,
      customerDetails: bookingData.contactDetails,
      errorDetails: {
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    },
  });
}

/**
 * Categorize booking errors to provide user-friendly messages
 */
function categorizeBookingError(
  errorMessage: string,
  bookingType: string
): {
  userMessage: string;
  errorType: string;
  requiresRefund: boolean;
} {
  const lowerError = errorMessage.toLowerCase();

  // Seat already booked - most common post-payment failure
  if (
    lowerError.includes("already booked") ||
    lowerError.includes("seat") && lowerError.includes("not available") ||
    lowerError.includes("seats are taken")
  ) {
    return {
      errorType: "SEAT_UNAVAILABLE",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Seat Selection Issue\n\n" +
        "Your payment of ₹{amount} has been successfully processed. However, the seats you selected are no longer available as they were booked by another customer during checkout.\n\n" +
        "What happens next:\n" +
        "✓ Your payment is safe and secure\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll offer you alternative seats on the same ferry\n" +
        "✓ If alternatives aren't suitable, we'll process a full refund within 5-7 business days\n\n" +
        "You'll receive an email at {email} with next steps.\n\n" +
        "For immediate assistance, call us at +91-XXXX-XXXX\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Capacity/availability issues
  if (
    lowerError.includes("capacity") ||
    lowerError.includes("full") ||
    lowerError.includes("no availability") ||
    lowerError.includes("sold out")
  ) {
    return {
      errorType: "CAPACITY_FULL",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Ferry Fully Booked\n\n" +
        "Your payment has been processed, but unfortunately this ferry has reached full capacity.\n\n" +
        "What happens next:\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll suggest alternative ferry timings\n" +
        "✓ If no alternatives work, full refund in 5-7 business days\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Date/schedule issues
  if (
    lowerError.includes("date") ||
    lowerError.includes("schedule") ||
    lowerError.includes("cancelled") ||
    lowerError.includes("not operating")
  ) {
    return {
      errorType: "SCHEDULE_ISSUE",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Schedule Change\n\n" +
        "Your payment was successful, but there's an issue with the ferry schedule.\n\n" +
        "What happens next:\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll help you book an alternative ferry\n" +
        "✓ Full refund available if needed (5-7 business days)\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // API/technical errors
  if (
    lowerError.includes("timeout") ||
    lowerError.includes("connection") ||
    lowerError.includes("network") ||
    lowerError.includes("api")
  ) {
    return {
      errorType: "TECHNICAL_ERROR",
      requiresRefund: false,
      userMessage:
        "⚠️ Payment Successful - Processing Your Booking\n\n" +
        "Your payment was successful but we encountered a technical issue while confirming your booking.\n\n" +
        "What happens next:\n" +
        "✓ Our team is actively processing your booking\n" +
        "✓ You'll receive confirmation within 1-2 hours\n" +
        "✓ No action needed from your side\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Generic/unknown error
  return {
    errorType: "UNKNOWN",
    requiresRefund: false,
    userMessage:
      "⚠️ Payment Successful - Booking Being Processed\n\n" +
      "Your payment was successful. We're currently processing your booking and will confirm shortly.\n\n" +
      "What happens next:\n" +
      "✓ Our team will review and process your booking\n" +
      "✓ You'll receive confirmation within 2-4 hours\n" +
      "✓ If any issues arise, we'll contact you immediately\n\n" +
      "Booking Reference: {bookingId}\n\n" +
      "For questions, contact us at +91-XXXX-XXXX",
  };
}
