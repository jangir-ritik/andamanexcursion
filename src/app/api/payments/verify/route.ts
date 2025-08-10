import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";
import {
  EmailService,
  BookingData,
} from "@/services/notifications/emailService";

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
          bookingDate: new Date().toISOString(), // Will be overridden by hooks
          customerInfo: {
            primaryContactName: bookingData.members?.[0]?.fullName || "",
            customerEmail: bookingData.members?.[0]?.email || "",
            customerPhone: bookingData.members?.[0]?.whatsappNumber || "",
            nationality: bookingData.members?.[0]?.nationality || "Indian",
          },
          bookingType: bookingData.bookingType || "activity",
          serviceDate:
            bookingData.bookingType === "ferry"
              ? bookingData.items?.[0]?.date
              : bookingData.activities?.[0]?.activityBooking?.searchParams
                  ?.date || new Date().toISOString(),
          bookedActivities:
            bookingData.bookingType === "activity"
              ? await Promise.all(
                  bookingData.activities?.map(
                    async (activity: any, index: number) => {
                      // Look up activity by slug to get ObjectId
                      let activityId = null;
                      if (activity.activityBooking?.activity?.slug) {
                        try {
                          const activityDoc = await payload.find({
                            collection: "activities",
                            where: {
                              slug: {
                                equals: activity.activityBooking.activity.slug,
                              },
                            },
                            limit: 1,
                          });
                          activityId = activityDoc.docs[0]?.id || null;
                          console.log(
                            `Activity lookup: slug=${activity.activityBooking.activity.slug}, found_id=${activityId}`
                          );
                        } catch (error) {
                          console.error(
                            `Failed to find activity with slug ${activity.activityBooking.activity.slug}:`,
                            error
                          );
                        }
                      } else if (activity.activityBooking?.activity?.id) {
                        activityId = activity.activityBooking.activity.id;
                        console.log(
                          `Using existing activity ID: ${activityId}`
                        );
                      }

                      if (!activityId) {
                        console.error(
                          `No activity ID found for:`,
                          activity.activityBooking?.activity
                        );
                        throw new Error(
                          `Activity not found: ${
                            activity.activityBooking?.activity?.slug ||
                            activity.activityBooking?.activity?.title ||
                            "Unknown"
                          }`
                        );
                      }

                      // Look up location by slug/id if provided
                      let locationId = null;
                      const locationData =
                        activity.activityBooking?.activity?.coreInfo
                          ?.location?.[0];
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
                          console.log(
                            `Using existing location ID: ${locationId}`
                          );
                        }
                      }

                      return {
                        activity: activityId,
                        activityOption:
                          activity.activityBooking?.activityOptionId,
                        quantity: activity.activityBooking?.quantity,
                        unitPrice:
                          activity.activityBooking?.totalPrice /
                          activity.activityBooking?.quantity,
                        totalPrice: activity.activityBooking?.totalPrice,
                        scheduledTime:
                          activity.activityBooking?.searchParams?.time,
                        location: locationId,
                        passengers: {
                          adults:
                            activity.activityBooking?.searchParams?.adults || 0,
                          children:
                            activity.activityBooking?.searchParams?.children ||
                            0,
                          infants: 0,
                        },
                      };
                    }
                  ) || []
                )
              : [],
          // Note: bookedFerries field removed due to schema constraints
          // Ferry booking details are stored in the providerBookingResult instead
          passengers:
            bookingData.members?.map((member: any) => ({
              isPrimary: member.isPrimary,
              fullName: member.fullName,
              age: member.age,
              gender: member.gender,
              nationality: member.nationality,
              passportNumber: member.passportNumber,
              whatsappNumber: member.whatsappNumber,
              email: member.email,
              assignedActivities:
                member.selectedActivities?.map((activityIndex: number) => ({
                  activityIndex,
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
          const bookingRequest = {
            operator: ferryItem.ferry?.operator || "unknown",
            ferryId: ferryItem.ferry?.ferryId || ferryItem.id,
            fromLocation: ferryItem.ferry?.fromLocation || "",
            toLocation: ferryItem.ferry?.toLocation || "",
            date: ferryItem.date,
            time: ferryItem.time,
            classId: ferryItem.ferry?.selectedClass?.id || "",
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

          console.log(
            "🚢 Initiating ferry provider booking:",
            bookingRequest.operator
          );
          providerBookingResult = await FerryBookingService.bookFerry(
            bookingRequest as any
          );

          if (!providerBookingResult.success) {
            console.error(
              "Ferry provider booking failed:",
              providerBookingResult.error
            );
            // Note: Payment was successful but ferry booking failed
            // This needs to be handled carefully - maybe refund or manual intervention
          }
        } catch (ferryBookingError) {
          console.error("Ferry booking service error:", ferryBookingError);
          // Payment successful but ferry booking failed
          providerBookingResult = {
            success: false,
            error:
              ferryBookingError instanceof Error
                ? ferryBookingError.message
                : "Ferry booking failed",
          };
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

          // Prepare email data
          const emailData: BookingData = {
            bookingId: bookingRecord.bookingId,
            confirmationNumber: bookingRecord.confirmationNumber,
            customerName: bookingRecord.customerInfo.primaryContactName,
            customerEmail: bookingRecord.customerInfo.customerEmail,
            bookingDate: bookingRecord.bookingDate,
            serviceDate: bookingData.items?.[0]?.date,
            totalAmount: bookingRecord.pricing.totalAmount,
            currency: bookingRecord.pricing.currency || "INR",
            bookingType: bookingData.bookingType || "mixed",
            items:
              bookingData.items?.map((item: any) => ({
                title:
                  item.title ||
                  (item.ferry?.ferryName
                    ? `Ferry: ${item.ferry.ferryName}`
                    : item.activityBooking?.activity?.title || "Booking Item"),
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

          const emailResult = await EmailService.sendBookingConfirmation(
            emailData
          );

          if (emailResult.success) {
            console.log("Booking confirmation email sent successfully");
          } else {
            console.error(
              "Failed to send booking confirmation email:",
              emailResult.error
            );
            // Log to booking record for admin visibility
            await payload.update({
              collection: "bookings",
              id: bookingRecord.id,
              data: {
                internalNotes: `${
                  bookingRecord.internalNotes || ""
                }\nEmail notification failed: ${emailResult.error}`,
              },
            });
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
