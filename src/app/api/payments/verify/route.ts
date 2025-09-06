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

      // ✅ FIX: Properly extract serviceDate based on booking type
      const getServiceDate = (bookingData: any): string => {
        if (
          (bookingData.bookingType === "ferry" ||
            bookingData.bookingType === "boat" ||
            bookingData.bookingType === "activity") &&
          bookingData.items?.[0]?.date
        ) {
          return bookingData.items[0].date;
        } else if (bookingData.serviceDate) {
          return bookingData.serviceDate;
        }
        // Fallback to tomorrow's date if no date provided
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      };

      // ✅ FIX: Process activities for activity bookings
      const processedActivities =
        bookingData.bookingType === "activity" && bookingData.items
          ? await Promise.all(
              bookingData.items.map(async (item: any) => {
                // Look up activity by slug to get ObjectId
                let activityId = null;
                if (item.activity?.slug) {
                  try {
                    const activityDoc = await payload.find({
                      collection: "activities",
                      where: {
                        slug: {
                          equals: item.activity.slug,
                        },
                      },
                      limit: 1,
                    });
                    activityId = activityDoc.docs[0]?.id || null;
                    console.log(
                      `Activity lookup: slug=${item.activity.slug}, found_id=${activityId}`
                    );
                  } catch (error) {
                    console.error(
                      `Failed to find activity with slug ${item.activity.slug}:`,
                      error
                    );
                  }
                } else if (item.activity?.id) {
                  activityId = item.activity.id;
                  console.log(`Using existing activity ID: ${activityId}`);
                }

                if (!activityId) {
                  console.error(`No activity ID found for:`, item.activity);
                  throw new Error(
                    `Activity not found: ${
                      item.activity?.slug || item.activity?.title || "Unknown"
                    }`
                  );
                }

                // Look up location by slug/id if provided
                let locationId = null;
                const locationData = item.activity?.coreInfo?.location?.[0];
                if (locationData) {
                  if (locationData.slug) {
                    try {
                      const locationDoc = await payload.find({
                        collection: "locations",
                        where: {
                          slug: {
                            equals: locationData.slug,
                          },
                        },
                        limit: 1,
                      });
                      locationId = locationDoc.docs[0]?.id || null;
                      console.log(
                        `Location lookup: slug=${locationData.slug}, found_id=${locationId}`
                      );
                    } catch (error) {
                      console.error(
                        `Failed to find location with slug ${locationData.slug}:`,
                        error
                      );
                    }
                  } else if (locationData.id) {
                    locationId = locationData.id;
                    console.log(`Using existing location ID: ${locationId}`);
                  }
                }

                return {
                  activity: activityId,
                  activityOption: item.searchParams?.activityType || "",
                  quantity: 1,
                  unitPrice: item.price || 0,
                  totalPrice: item.price || 0,
                  scheduledTime: item.time || "",
                  location: locationId,
                  passengers: {
                    adults:
                      item.passengers?.adults || item.searchParams?.adults || 0,
                    children:
                      item.passengers?.children ||
                      item.searchParams?.children ||
                      0,
                    infants: item.passengers?.infants || 0,
                  },
                };
              })
            )
          : [];

      // Create booking record with fixed data structure
      const bookingRecord = await payload.create({
        collection: "bookings",
        data: {
          bookingType: bookingData.bookingType || "activity",
          // ✅ FIX: Use the proper serviceDate extraction
          serviceDate: getServiceDate(bookingData),
          customerInfo: {
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
          // ✅ FIX: Use processed activities
          bookedActivities: processedActivities,
          // Handle boat bookings
          bookedBoats:
            bookingData.bookingType === "boat" && bookingData.items?.[0]
              ? [
                  {
                    boatRoute: bookingData.items[0].boat?.id || null,
                    boatName:
                      bookingData.items[0].boat?.name ||
                      bookingData.items[0].title ||
                      "Unknown Boat",
                    route: {
                      from:
                        bookingData.items[0].boat?.route?.from ||
                        bookingData.items[0].location ||
                        "Unknown",
                      to: bookingData.items[0].boat?.route?.to || "Unknown",
                    },
                    schedule: {
                      departureTime:
                        bookingData.items[0].selectedTime ||
                        bookingData.items[0].time ||
                        "Unknown",
                      duration:
                        bookingData.items[0].boat?.route?.minTimeAllowed ||
                        bookingData.items[0].boat?.minTimeAllowed ||
                        "Unknown",
                      travelDate: new Date(
                        bookingData.items[0].date || getServiceDate(bookingData)
                      ).toISOString(),
                    },
                    passengers: {
                      adults: bookingData.items[0].passengers?.adults || 0,
                      children: bookingData.items[0].passengers?.children || 0,
                      infants: bookingData.items[0].passengers?.infants || 0,
                    },
                    totalPrice:
                      bookingData.items[0].price || bookingData.totalPrice || 0,
                  },
                ]
              : [],
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
                      // ✅ FIX: Better route data extraction with fallbacks
                      from:
                        bookingData.items[0].ferry?.route?.from?.name ||
                        bookingData.items[0].ferry?.route?.from ||
                        bookingData.items[0].ferry?.fromLocation ||
                        bookingData.items[0].fromLocation ||
                        bookingData.searchParams?.from ||
                        "Unknown",
                      to:
                        bookingData.items[0].ferry?.route?.to?.name ||
                        bookingData.items[0].ferry?.route?.to ||
                        bookingData.items[0].ferry?.toLocation ||
                        bookingData.items[0].toLocation ||
                        bookingData.searchParams?.to ||
                        "Unknown",
                      fromCode:
                        bookingData.items[0].ferry?.route?.from?.code ||
                        bookingData.items[0].ferry?.route?.fromCode ||
                        "",
                      toCode:
                        bookingData.items[0].ferry?.route?.to?.code ||
                        bookingData.items[0].ferry?.route?.toCode ||
                        "",
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
                        bookingData.items[0].date || getServiceDate(bookingData)
                      ).toISOString(),
                    },
                    selectedClass: {
                      classId:
                        bookingData.items[0].ferry?.selectedClass?.classId ||
                        bookingData.items[0].ferry?.selectedClass?.id ||
                        bookingData.items[0].selectedClass?.classId ||
                        bookingData.items[0].selectedClass?.id ||
                        "unknown",
                      className:
                        bookingData.items[0].ferry?.selectedClass?.className ||
                        bookingData.items[0].ferry?.selectedClass?.name ||
                        bookingData.items[0].selectedClass?.className ||
                        bookingData.items[0].selectedClass?.name ||
                        "Unknown Class",
                      price:
                        bookingData.items[0].ferry?.selectedClass?.price ||
                        bookingData.items[0].selectedClass?.price ||
                        0,
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
                      ) ||
                      bookingData.items[0].selectedSeats?.map((seat: any) => ({
                        seatNumber:
                          seat.number ||
                          seat.seatNumber ||
                          seat ||
                          "Auto-assigned",
                        seatId: seat.id || seat.seatId || "",
                        passengerName: "", // Will be filled from passenger details
                      })) ||
                      [],
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
                  : bookingData.items?.map((item: any, itemIndex: number) => ({
                      activityIndex: itemIndex,
                    })) || [],
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
          
          // CRITICAL FIX: Use the correct ferry ID, not the session ID
          const actualFerryId = ferryItem.ferryId || ferryItem.ferry?.ferryId;
          if (!actualFerryId) {
            throw new Error(
              `Ferry ID not found in booking data. Session ID: ${ferryItem.id}. ` +
              `Expected ferryItem.ferryId or ferryItem.ferry.ferryId to contain the actual ferry ID (e.g., sealink-68afe5056bbf62f3db17a8c8). ` +
              `Available properties: ${Object.keys(ferryItem).join(', ')}`
            );
          }
          
          const bookingRequest = {
            operator: ferryItem.ferry?.operator || "unknown",
            ferryId: actualFerryId, // Use actual ferry ID, never fall back to session ID
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
          const FERRY_BOOKING_TIMEOUT = 75000; // 75 seconds total timeout

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
                `⏱️ Ferry booking process timed out after ${
                  FERRY_BOOKING_TIMEOUT / 1000
                } seconds`
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
            // Helper function to format phone number
            const formatPhoneNumber = (phone: string): string => {
              if (!phone) return "";

              const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

              // Already has +91
              if (cleanPhone.startsWith("+91")) return cleanPhone;

              // 10-digit Indian mobile number
              if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
                return "+91" + cleanPhone;
              }

              return phone;
            };

            // Prepare email data
            const emailData: BookingConfirmationData = {
              bookingId: bookingRecord.bookingId || "",
              confirmationNumber: bookingRecord.confirmationNumber || "",
              customerName: bookingRecord.customerInfo.primaryContactName,
              customerEmail: bookingRecord.customerInfo.customerEmail,
              bookingDate: bookingRecord.bookingDate || "",
              serviceDate: getServiceDate(bookingData),
              totalAmount: bookingRecord.pricing.totalAmount,
              currency: bookingRecord.pricing.currency || "INR",
              bookingType: bookingData.bookingType || "mixed",
              items:
                bookingData.items?.map((item: any) => ({
                  title:
                    item.title ||
                    (item.ferry?.ferryName
                      ? `Ferry: ${item.ferry.ferryName}`
                      : item.activity?.title || "Booking Item"),
                  date: item.date || "",
                  time: item.time || "",
                  location: item.ferry
                    ? `${item.ferry.fromLocation} → ${item.ferry.toLocation}`
                    : item.activity?.coreInfo?.location?.[0]?.name,
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
              contactPhone: formatPhoneNumber(
                bookingRecord.customerInfo.customerPhone
              ),
            };

            // Format phone number for WhatsApp
            const formattedPhone = formatPhoneNumber(
              bookingRecord.customerInfo.customerPhone
            );
            const hasValidPhone = !!(
              formattedPhone && formattedPhone.match(/^\+91[6-9]\d{9}$/)
            );

            console.log("Notification recipients:", {
              email: bookingRecord.customerInfo.customerEmail,
              phone: formattedPhone,
              phoneValid: hasValidPhone,
              originalPhone: bookingRecord.customerInfo.customerPhone,
            });

            // Send notifications to both email and WhatsApp
            const notificationResult =
              await notificationManager.sendBookingConfirmation(
                emailData,
                {
                  email: bookingRecord.customerInfo.customerEmail,
                  phone: hasValidPhone ? formattedPhone : undefined, // Only include if valid
                },
                {
                  sendEmailUpdates: true,
                  sendWhatsAppUpdates: hasValidPhone, // Enable if we have a valid phone
                  language: "en",
                }
              );

            // Log results
            if (notificationResult.email?.success) {
              console.log("Booking confirmation email sent successfully");
            } else {
              console.error(
                "Failed to send booking confirmation email:",
                notificationResult.email?.error
              );
            }

            if (hasValidPhone) {
              if (notificationResult.whatsapp?.success) {
                console.log("Booking confirmation WhatsApp sent successfully");
              } else {
                console.error(
                  "Failed to send booking confirmation WhatsApp:",
                  notificationResult.whatsapp?.error
                );
              }
            } else {
              console.warn("No valid phone number for WhatsApp notification:", {
                original: bookingRecord.customerInfo.customerPhone,
                formatted: formattedPhone,
              });
            }

            const notificationErrors: string[] = [];
            if (!notificationResult.email?.success) {
              notificationErrors.push(
                `Email: ${notificationResult.email?.error}`
              );
            }
            if (hasValidPhone && !notificationResult.whatsapp?.success) {
              notificationErrors.push(
                `WhatsApp: ${notificationResult.whatsapp?.error}`
              );
            }

            if (notificationErrors.length > 0) {
              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  internalNotes: `${
                    bookingRecord.internalNotes || ""
                  }\nNotification failures: ${notificationErrors.join(
                    ", "
                  )} (${new Date().toISOString()})`,
                },
              });
            }

            // const emailResult =
            //   await notificationManager.sendBookingConfirmation(
            //     emailData,
            //     { email: bookingRecord.customerInfo.customerEmail },
            //     {
            //       sendEmailUpdates: true,
            //       sendWhatsAppUpdates: true,
            //       language: "en",
            //     }
            //   );

            // if (emailResult.email?.success) {
            //   console.log("Booking confirmation email sent successfully");
            // } else {
            //   console.error(
            //     "Failed to send booking confirmation email:",
            //     emailResult.email?.error
            //   );
            //   // Log to booking record for admin visibility
            //   await payload.update({
            //     collection: "bookings",
            //     id: bookingRecord.id,
            //     data: {
            //       internalNotes: `${
            //         bookingRecord.internalNotes || ""
            //       }\nEmail notification failed: ${emailResult.email?.error}`,
            //     },
            //   });
            // }
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
