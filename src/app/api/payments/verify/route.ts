import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";

import { notificationManager } from "@/services/notifications/NotificationManager";
import type { BookingConfirmationData } from "@/services/notifications/channels/base";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
      sessionId,
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.error("Payment signature verification failed:", {
        expected: expectedSign,
        received: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return NextResponse.json(
        { error: "Payment verification failed - invalid signature" },
        { status: 400 }
      );
    }

    // Get Payload CMS instance
    const payload = await getPayload({ config });

    // Debug: Log the structure of incoming booking data
    console.log("=== Payment Verification Debug ===");
    console.log(
      "Booking data structure:",
      JSON.stringify(bookingData, null, 2)
    );
    console.log(
      "Activities:",
      bookingData.activities?.map((a: any) => ({
        slug: a.activityBooking?.activity?.slug,
        id: a.activityBooking?.activity?.id,
        title: a.activityBooking?.activity?.title,
      }))
    );

    try {
      // Create payment record first
      const paymentRecord = await payload.create({
        collection: "payments",
        data: {
          razorpayData: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
          amount: bookingData.totalPrice * 100, // Convert to paise
          currency: "INR",
          paymentMethod: "other", // Will be updated from webhook
          status: "success",
          paymentDate: new Date().toISOString(),
          customerDetails: {
            customerName: bookingData.members?.[0]?.fullName || "",
            customerEmail: bookingData.members?.[0]?.email || "",
            customerPhone: bookingData.members?.[0]?.whatsappNumber || "",
          },
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            verified_at: new Date().toISOString(),
          },
        },
      });

      // Create booking record
      const bookingRecord = await payload.create({
        collection: "bookings",
        data: {
          bookingType: bookingData.bookingType || "activity",
          // Fix: Map serviceDate from items[0].date for ferry bookings
          serviceDate:
            bookingData.bookingType === "ferry"
              ? bookingData.items?.[0]?.date ||
                new Date().toISOString().split("T")[0]
              : bookingData.serviceDate,
          customerInfo: {
            // Fix: Map from contactDetails structure
            primaryContactName:
              bookingData.contactDetails?.primaryName ||
              bookingData.primaryContactName ||
              bookingData.members?.[0]?.fullName ||
              "",
            customerEmail:
              bookingData.contactDetails?.email ||
              bookingData.customerEmail ||
              bookingData.members?.[0]?.email ||
              "",
            customerPhone:
              bookingData.contactDetails?.whatsapp ||
              bookingData.customerPhone ||
              bookingData.members?.[0]?.whatsappNumber ||
              "",
            nationality: bookingData.nationality || "Indian",
          },
          // Handle activities
          bookedActivities:
            bookingData.bookingType === "ferry"
              ? []
              : bookingData.activities?.map(
                  (activity: any, activityIndex: number) => ({
                    activity: activity.id,
                    activityOption: activity.selectedOption?.name || "",
                    quantity: activity.quantity || 1,
                    unitPrice: activity.selectedOption?.pricing?.price || 0,
                    totalPrice: activity.totalPrice || 0,
                    scheduledTime: activity.selectedTime || "",
                    location: activity.location?.id || null,
                    passengers: {
                      adults: activity.passengers?.adults || 0,
                      children: activity.passengers?.children || 0,
                      infants: activity.passengers?.infants || 0,
                    },
                  })
                ) || [],
          // Handle ferry bookings
          bookedFerries:
            bookingData.bookingType === "ferry" && bookingData.items?.[0]
              ? [
                  {
                    operator: (["sealink", "makruzz", "greenocean"].includes(
                      bookingData.items[0].ferry?.operator
                    )
                      ? bookingData.items[0].ferry?.operator
                      : "greenocean") as "sealink" | "makruzz" | "greenocean",
                    ferryName:
                      bookingData.items[0].ferry?.ferryName ||
                      bookingData.items[0].title ||
                      "Unknown Ferry",
                    route: {
                      from:
                        bookingData.items[0].ferry?.route?.from ||
                        bookingData.items[0].ferry?.fromLocation ||
                        "Unknown",
                      to:
                        bookingData.items[0].ferry?.route?.to ||
                        bookingData.items[0].ferry?.toLocation ||
                        "Unknown",
                      fromCode:
                        bookingData.items[0].ferry?.route?.fromCode || "",
                      toCode: bookingData.items[0].ferry?.route?.toCode || "",
                    },
                    schedule: {
                      departureTime:
                        bookingData.items[0].ferry?.schedule?.departureTime ||
                        bookingData.items[0].time ||
                        "Unknown",
                      arrivalTime:
                        bookingData.items[0].ferry?.schedule?.arrivalTime ||
                        "Unknown",
                      duration:
                        bookingData.items[0].ferry?.schedule?.duration ||
                        "Unknown",
                      // Fix: Ensure travelDate is an ISO string for Payload
                      travelDate: new Date(
                        bookingData.items[0].date ||
                          bookingData.serviceDate ||
                          new Date().toISOString().split("T")[0]
                      ).toISOString(),
                    },
                    selectedClass: {
                      classId:
                        bookingData.items[0].ferry?.selectedClass?.classId ||
                        bookingData.items[0].ferry?.selectedClass?.id ||
                        "unknown",
                      className:
                        bookingData.items[0].ferry?.selectedClass?.className ||
                        bookingData.items[0].ferry?.selectedClass?.name ||
                        "Unknown Class",
                      price:
                        bookingData.items[0].ferry?.selectedClass?.price || 0,
                    },
                    passengers: {
                      adults: bookingData.items[0].passengers?.adults || 0,
                      children: bookingData.items[0].passengers?.children || 0,
                      infants: bookingData.items[0].passengers?.infants || 0,
                    },
                    selectedSeats:
                      bookingData.items[0].ferry?.selectedSeats?.map(
                        (seat: any) => ({
                          seatNumber:
                            seat.number ||
                            seat.seatNumber ||
                            seat ||
                            "Auto-assigned",
                          seatId: seat.id || seat.seatId || "",
                          passengerName: "", // Will be filled from passenger details
                        })
                      ) || [],
                    providerBooking: {
                      pnr: "", // Will be updated after provider booking
                      operatorBookingId: "",
                      bookingStatus: "pending",
                      providerResponse: "",
                      errorMessage: "",
                    },
                    totalPrice:
                      bookingData.items[0].totalPrice ||
                      bookingData.totalPrice ||
                      0,
                  },
                ]
              : [],
          passengers:
            bookingData.members?.map((member: any, memberIndex: number) => ({
              isPrimary: memberIndex === 0,
              fullName: member.fullName,
              age: member.age,
              gender: member.gender,
              nationality: member.nationality || "Indian",
              passportNumber: member.passportNumber || "",
              whatsappNumber:
                memberIndex === 0
                  ? bookingData.contactDetails?.whatsapp ||
                    bookingData.customerPhone ||
                    member.whatsappNumber
                  : member.whatsappNumber,
              email:
                memberIndex === 0
                  ? bookingData.contactDetails?.email ||
                    bookingData.customerEmail ||
                    member.email
                  : member.email,
              assignedActivities:
                bookingData.bookingType === "ferry"
                  ? []
                  : bookingData.activities?.map(
                      (activity: any, activityIndex: number) => ({
                        activityIndex,
                      })
                    ) || [],
            })) || [],
          pricing: {
            subtotal: bookingData.totalPrice,
            taxes: 0,
            fees: 0,
            totalAmount: bookingData.totalPrice,
            currency: "INR",
          },
          status: "confirmed",
          paymentStatus: "paid",
          paymentTransactions: [paymentRecord.id],
          termsAccepted: bookingData.termsAccepted || false,
          communicationPreferences: {
            sendWhatsAppUpdates: true,
            sendEmailUpdates: true,
            language: "en",
          },
        },
      });

      // Handle ferry provider booking if this is a ferry booking
      let providerBookingResult = null;
      if (bookingData.bookingType === "ferry" && bookingData.items?.[0]) {
        try {
          const ferryItem = bookingData.items[0];
          const bookingRequest = {
            operator: ferryItem.ferry?.operator || "unknown",
            ferryId: ferryItem.ferry?.ferryId || ferryItem.id,
            fromLocation: ferryItem.ferry?.fromLocation || "",
            toLocation: ferryItem.ferry?.toLocation || "",
            date: ferryItem.date,
            time: ferryItem.time,
            classId:
              ferryItem.ferry?.selectedClass?.classId ||
              ferryItem.ferry?.selectedClass?.id ||
              "",
            routeId: ferryItem.ferry?.routeData?.routeId || "1",
            passengers: {
              adults: ferryItem.passengers?.adults || 0,
              children: ferryItem.passengers?.children || 0,
              infants: ferryItem.passengers?.infants || 0,
            },
            selectedSeats: ferryItem.ferry?.selectedSeats || [],
            passengerDetails: bookingData.members || [],
            paymentReference: razorpay_payment_id,
            totalAmount: bookingData.totalPrice,
          };

          console.log("🚢 Initiating ferry provider booking:", {
            operator: bookingRequest.operator,
            ferryId: bookingRequest.ferryId,
            passengers: bookingRequest.passengers,
            seats: bookingRequest.selectedSeats?.length || 0,
            paymentRef: razorpay_payment_id,
          });

          // Set a timeout for the entire ferry booking process
          const FERRY_BOOKING_TIMEOUT = 45000; // 45 seconds total timeout

          const ferryBookingPromise = FerryBookingService.bookFerry(
            bookingRequest as any
          );
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Ferry booking process timeout")),
              FERRY_BOOKING_TIMEOUT
            )
          );

          try {
            providerBookingResult = await Promise.race([
              ferryBookingPromise,
              timeoutPromise,
            ]);
          } catch (timeoutError: any) {
            if (timeoutError.message.includes("timeout")) {
              console.warn(
                "⏱️ Ferry booking process timed out after 45 seconds"
              );
              providerBookingResult = {
                success: false,
                error:
                  "Ferry booking timed out. Your payment was successful, but the ferry booking is still processing. You will receive an email confirmation once it's complete, or contact support if you don't hear back within 30 minutes.",
                errorType: "timeout",
                shouldRetry: false,
              };
            } else {
              throw timeoutError;
            }
          }

          // Handle the booking result with enhanced error messaging
          if (!providerBookingResult.success) {
            console.error("❌ Ferry provider booking failed:", {
              error: providerBookingResult.error,
              errorType: (providerBookingResult as any).errorType,
              shouldRetry: (providerBookingResult as any).shouldRetry,
            });

            // Update booking record with detailed error information
            const currentBooking = await payload.findByID({
              collection: "bookings",
              id: bookingRecord.id,
            });

            if (
              currentBooking.bookedFerries &&
              currentBooking.bookedFerries.length > 0
            ) {
              const updatedFerries = [...currentBooking.bookedFerries];

              // Set appropriate status based on error type
              let bookingStatus: "failed" | "pending" = "failed";
              let errorMessage =
                providerBookingResult.error || "Provider booking failed";

              if ((providerBookingResult as any).errorType === "timeout") {
                bookingStatus = "pending"; // Timeout means it might still succeed
                errorMessage = "Booking timed out - may still be processing";
              }

              updatedFerries[0] = {
                ...updatedFerries[0],
                providerBooking: {
                  ...updatedFerries[0].providerBooking,
                  bookingStatus,
                  errorMessage,
                  operatorBookingId:
                    (providerBookingResult as any).errorType || "unknown",
                  pnr: (providerBookingResult as any).shouldRetry
                    ? "retry"
                    : "failed",
                },
              };

              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  bookedFerries: updatedFerries,
                  status: "confirmed",
                  internalNotes: `Ferry booking failed: ${errorMessage} (${new Date().toISOString()})`,
                },
              });
            }
          } else {
            // Handle successful ferry booking
            console.log("✅ Ferry provider booking successful:", {
              providerBookingId: providerBookingResult.providerBookingId,
              pnr: providerBookingResult.confirmationDetails?.pnr,
              operator: providerBookingResult.confirmationDetails?.operator,
            });

            // Update booking record with successful booking details
            const currentBooking = await payload.findByID({
              collection: "bookings",
              id: bookingRecord.id,
            });

            if (
              currentBooking.bookedFerries &&
              currentBooking.bookedFerries.length > 0
            ) {
              const updatedFerries = [...currentBooking.bookedFerries];
              const confirmationDetails =
                providerBookingResult.confirmationDetails;

              updatedFerries[0] = {
                ...updatedFerries[0],
                providerBooking: {
                  ...updatedFerries[0].providerBooking,
                  bookingStatus: "confirmed" as const,
                  pnr:
                    confirmationDetails?.pnr ||
                    providerBookingResult.providerBookingId,
                  operatorBookingId: providerBookingResult.providerBookingId,
                  providerResponse: JSON.stringify({
                    operator: confirmationDetails?.operator,
                    pnr: confirmationDetails?.pnr,
                    totalAmount: confirmationDetails?.totalAmount,
                    totalCommission: confirmationDetails?.totalCommission,
                    ferryId: confirmationDetails?.ferryId,
                    travelDate: confirmationDetails?.travelDate,
                    adultCount: confirmationDetails?.adultCount,
                    infantCount: confirmationDetails?.infantCount,
                    seats: confirmationDetails?.seats,
                    tickets: confirmationDetails?.tickets,
                  }),
                },
              };

              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  bookedFerries: updatedFerries,
                  status: "confirmed",
                  internalNotes: `Ferry booking confirmed: PNR ${
                    confirmationDetails?.pnr ||
                    providerBookingResult.providerBookingId
                  } (${new Date().toISOString()})`,
                },
              });
            }
          }
        } catch (error) {
          console.error("❌ Ferry booking service error:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack:
              error instanceof Error
                ? error.stack?.split("\n").slice(0, 2).join("\n")
                : "",
            paymentId: razorpay_payment_id,
          });

          // Determine error type and message
          let errorMessage = "Ferry booking failed";
          let errorType = "unknown";
          let bookingStatus: "failed" | "pending" = "failed";

          if (error instanceof Error && error.message.includes("timeout")) {
            errorMessage = "Ferry booking timed out - may still be processing";
            errorType = "timeout";
            bookingStatus = "pending";
          } else if (
            error instanceof Error &&
            error.message.includes("network")
          ) {
            errorMessage = "Network error during ferry booking";
            errorType = "network";
            bookingStatus = "failed";
          } else {
            errorMessage =
              error instanceof Error
                ? error.message
                : "Unexpected ferry booking error";
            errorType = "service_error";
            bookingStatus = "failed";
          }

          providerBookingResult = {
            success: false,
            error: errorMessage,
            errorType: errorType,
            shouldRetry: errorType === "timeout" || errorType === "network",
          };

          // Update booking record with error
          try {
            const currentBooking = await payload.findByID({
              collection: "bookings",
              id: bookingRecord.id,
            });

            if (
              currentBooking.bookedFerries &&
              currentBooking.bookedFerries.length > 0
            ) {
              const updatedFerries = [...currentBooking.bookedFerries];
              updatedFerries[0] = {
                ...updatedFerries[0],
                providerBooking: {
                  ...updatedFerries[0].providerBooking,
                  bookingStatus,
                  errorMessage,
                  operatorBookingId: (providerBookingResult as any).shouldRetry
                    ? "failed"
                    : "failed",
                },
              };

              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  bookedFerries: updatedFerries,
                  status: bookingStatus === "pending" ? "pending" : "confirmed",
                  internalNotes: `Ferry booking error: ${errorMessage} (${new Date().toISOString()})`,
                },
              });
            }
          } catch (updateError) {
            console.error("Failed to update booking with error:", updateError);
          }
        }
      }

      // Update payment record with booking reference and provider booking result
      await payload.update({
        collection: "payments",
        id: paymentRecord.id,
        data: {
          bookingReference: bookingRecord.id,
          // Note: providerBookingResult field removed due to schema constraints
          // Provider booking result is stored in internalNotes instead
          // Store ferry booking result in the gatewayResponse field
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            verified_at: new Date().toISOString(),
            // Add ferry provider booking result
            ...(providerBookingResult && {
              ferryProviderBooking: {
                success: providerBookingResult.success,
                providerBookingId: providerBookingResult.providerBookingId,
                bookingReference: providerBookingResult.bookingReference,
                error: providerBookingResult.error,
              },
            }),
          },
        },
      });

      // Update booking session status if sessionId provided
      if (sessionId) {
        try {
          const sessions = await payload.find({
            collection: "booking-sessions",
            where: {
              sessionId: {
                equals: sessionId,
              },
            },
            limit: 1,
          });

          if (sessions.docs.length > 0) {
            await payload.update({
              collection: "booking-sessions",
              id: sessions.docs[0].id,
              data: {
                status: "converted",
                conversionData: {
                  convertedBookingId: bookingRecord.id,
                  convertedAt: new Date().toISOString(),
                  totalAmount: bookingData.totalPrice,
                },
              },
            });
          }
        } catch (sessionError) {
          console.error("Failed to update booking session:", sessionError);
          // Don't fail the entire process for session update failure
        }
      }

      console.log("Booking created successfully:", {
        bookingId: bookingRecord.bookingId,
        confirmationNumber: bookingRecord.confirmationNumber,
        paymentId: paymentRecord.transactionId,
      });

      // Send booking confirmation email
      try {
        if (bookingRecord.customerInfo?.customerEmail) {
          console.log("Sending booking confirmation email...");

          // Validate required booking data - log warning but don't fail the booking process
          if (
            !bookingRecord.bookingId ||
            !bookingRecord.confirmationNumber ||
            !bookingRecord.bookingDate
          ) {
            console.warn("Missing required booking data for email:", {
              bookingId: bookingRecord.bookingId,
              confirmationNumber: bookingRecord.confirmationNumber,
              bookingDate: bookingRecord.bookingDate,
            });
            // Log to booking record for admin visibility but don't fail the process
            await payload.update({
              collection: "bookings",
              id: bookingRecord.id,
              data: {
                internalNotes: `${
                  bookingRecord.internalNotes || ""
                }\nWarning: Email notification skipped due to missing required data (${new Date().toISOString()})`,
              },
            });
            console.warn(
              "Skipping email notification due to missing required booking data"
            );
          } else {
            // Prepare email data
            const emailData: BookingConfirmationData = {
              bookingId: bookingRecord.bookingId || "",
              confirmationNumber: bookingRecord.confirmationNumber || "",
              customerName: bookingRecord.customerInfo.primaryContactName,
              customerEmail: bookingRecord.customerInfo.customerEmail,
              bookingDate: bookingRecord.bookingDate || "",
              serviceDate: bookingData.items?.[0]?.date || "",
              totalAmount: bookingRecord.pricing.totalAmount,
              currency: bookingRecord.pricing.currency || "INR",
              bookingType: bookingData.bookingType || "mixed",
              items:
                bookingData.items?.map((item: any) => ({
                  title:
                    item.title ||
                    (item.ferry?.ferryName
                      ? `Ferry: ${item.ferry.ferryName}`
                      : item.activityBooking?.activity?.title ||
                        "Booking Item"),
                  date: item.date || "",
                  time: item.time || "",
                  location: item.ferry
                    ? `${item.ferry.fromLocation} → ${item.ferry.toLocation}`
                    : item.activityBooking?.activity?.location?.name,
                  passengers: item.passengers
                    ? (item.passengers.adults || 0) +
                      (item.passengers.children || 0) +
                      (item.passengers.infants || 0)
                    : undefined,
                })) || [],
              passengers:
                bookingData.members?.map((member: any) => ({
                  fullName: member.fullName,
                  age: member.age,
                  gender: member.gender,
                })) || [],
              specialRequests: bookingData.specialRequests,
              contactPhone: bookingRecord.customerInfo.customerPhone,
            };

            const emailResult =
              await notificationManager.sendBookingConfirmation(
                emailData,
                { email: bookingRecord.customerInfo.customerEmail },
                {
                  sendEmailUpdates: true,
                  sendWhatsAppUpdates: false,
                  language: "en",
                }
              );

            if (emailResult.email?.success) {
              console.log("Booking confirmation email sent successfully");
            } else {
              console.error(
                "Failed to send booking confirmation email:",
                emailResult.email?.error
              );
              // Log to booking record for admin visibility
              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  internalNotes: `${
                    bookingRecord.internalNotes || ""
                  }\nEmail notification failed: ${emailResult.email?.error}`,
                },
              });
            }
          }
        } else {
          console.warn("No customer email found, skipping confirmation email");
        }
      } catch (emailError) {
        console.error("Email service error:", emailError);
        // Don't fail the booking process for email errors
      }

      return NextResponse.json({
        success: true,
        booking: {
          bookingId: bookingRecord.bookingId,
          confirmationNumber: bookingRecord.confirmationNumber,
          status: bookingRecord.status,
          paymentStatus: bookingRecord.paymentStatus,
          totalAmount: bookingRecord.pricing.totalAmount,
          providerBooking: providerBookingResult
            ? {
                success: providerBookingResult.success,
                providerBookingId: providerBookingResult.providerBookingId,
                error: providerBookingResult.error,
              }
            : null,
        },
        payment: {
          transactionId: paymentRecord.transactionId,
          status: paymentRecord.status,
        },
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);

      return NextResponse.json(
        {
          error: "Failed to create booking record",
          details:
            dbError instanceof Error ? dbError.message : "Database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
