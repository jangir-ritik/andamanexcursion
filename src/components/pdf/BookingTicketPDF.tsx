import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles/pdfStyles";
import { formatDate, formatCurrency } from "./utils/formatters";
import { BookingTicketPDFProps } from "./types/booking.types";

const BookingTicketPDF: React.FC<BookingTicketPDFProps> = ({
  data,
  logoUrl,
  qrCodeUrl,
}) => {
  const isFerryBooking =
    data.bookingType === "ferry" ||
    (data.bookedFerries && data.bookedFerries.length > 0);
  const isActivityOrBoat =
    data.bookingType === "activity" || data.bookingType === "boat";

  const getTravelDate = () => {
    if (
      data.bookedFerries &&
      data.bookedFerries[0] &&
      data.bookedFerries[0].schedule.travelDate
    ) {
      return formatDate(data.bookedFerries[0].schedule.travelDate);
    }
    if (
      data.bookedBoats &&
      data.bookedBoats[0] &&
      data.bookedBoats[0].schedule.travelDate
    ) {
      return formatDate(data.bookedBoats[0].schedule.travelDate);
    }
    return formatDate(data.bookingDate);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          </View>
          {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrCode} />}
        </View>

        <View style={styles.content}>
          <View style={styles.infoBar}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Booking Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(data.bookingDate)}
              </Text>
            </View>
            {!isActivityOrBoat && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Travel Date</Text>
                <Text style={styles.infoValue}>{getTravelDate()}</Text>
              </View>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Booking Type</Text>
              <View style={styles.typeBadge}>
                <Text>{data.bookingType.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.confirmationHero}>
            <Text style={styles.confirmationLabel}>Booking ID</Text>
            <Text style={styles.confirmationNumber}>{data.bookingId}</Text>
            <View style={styles.statusBadge}>
              <Text>{data.status.toUpperCase()}</Text>
            </View>
          </View>

          {data.bookedFerries &&
            data.bookedFerries.map((ferry, idx) => (
              <View key={idx} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.ferryName}>{ferry.ferryName}</Text>
                  <View style={styles.operatorBadge}>
                    <Text>{ferry.operator.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.routeVisual}>
                  <View style={styles.location}>
                    <Text style={styles.locationName}>{ferry.route.from}</Text>
                    {ferry.route.fromCode && (
                      <Text style={styles.locationCode}>
                        {ferry.route.fromCode}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.arrow}>→</Text>
                  <View style={styles.location}>
                    <Text style={styles.locationName}>{ferry.route.to}</Text>
                    {ferry.route.toCode && (
                      <Text style={styles.locationCode}>
                        {ferry.route.toCode}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleItem}>
                    <Text style={styles.scheduleLabel}>Departure</Text>
                    <Text style={styles.scheduleValue}>
                      {ferry.schedule.departureTime}
                    </Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Text style={styles.scheduleLabel}>Arrival</Text>
                    <Text style={styles.scheduleValue}>
                      {ferry.schedule.arrivalTime}
                    </Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Text style={styles.scheduleLabel}>Class</Text>
                    <Text style={styles.scheduleValue}>
                      {ferry.selectedClass.className}
                    </Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Text style={styles.scheduleLabel}>Duration</Text>
                    <Text style={styles.scheduleValue}>
                      {ferry.schedule.duration || "N/A"}
                    </Text>
                  </View>
                </View>

                {ferry.providerBooking && ferry.providerBooking.pnr && (
                  <View style={styles.pnrBox}>
                    <Text style={styles.pnrText}>PNR</Text>
                    <Text style={styles.pnrValue}>
                      {ferry.providerBooking.pnr}
                    </Text>
                  </View>
                )}

                {ferry.selectedSeats && ferry.selectedSeats.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.scheduleLabel}>Seats</Text>
                    <Text style={styles.scheduleValue}>
                      {ferry.selectedSeats.map((s) => s.seatNumber).join(", ")}
                    </Text>
                  </View>
                )}
              </View>
            ))}

          {data.bookedActivities &&
            data.bookedActivities.map((activity, idx) => (
              <View key={idx} style={styles.activityCard}>
                <Text style={styles.activityName}>
                  {(activity.activity &&
                    (activity.activity.name || activity.activity.title)) ||
                    "Activity"}
                </Text>
                {activity.activityOption && (
                  <Text style={styles.activityDetail}>
                    Option: {activity.activityOption}
                  </Text>
                )}
                <Text style={styles.activityDetail}>
                  Quantity: {activity.quantity} | Price:{" "}
                  {formatCurrency(activity.totalPrice)}
                </Text>
                {activity.scheduledTime && (
                  <Text style={styles.activityDetail}>
                    Time: {activity.scheduledTime}
                  </Text>
                )}
              </View>
            ))}

          {data.bookedBoats &&
            data.bookedBoats.map((boat, idx) => (
              <View key={idx} style={styles.activityCard}>
                <Text style={styles.activityName}>{boat.boatName}</Text>
                <Text style={styles.activityDetail}>
                  Route: {boat.route.from} → {boat.route.to}
                </Text>
                <Text style={styles.activityDetail}>
                  Departure: {boat.schedule.departureTime} |{" "}
                  {formatDate(boat.schedule.travelDate)}
                </Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Passenger Details</Text>
          {isFerryBooking ? (
            <View style={styles.ferryTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "8%" }]}>
                  SNO
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "28%" }]}>
                  Passenger
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
                  Seat
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>
                  Base
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>
                  GST
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>
                  PMB
                </Text>
                <Text style={[styles.tableHeaderCell, { width: "13%" }]}>
                  Total
                </Text>
              </View>
              {data.passengers.map((p, idx) => {
                const ferry = data.bookedFerries && data.bookedFerries[0];
                const seat =
                  ferry && ferry.selectedSeats && ferry.selectedSeats[idx]
                    ? ferry.selectedSeats[idx].seatNumber
                    : "-";
                const base =
                  ferry && ferry.selectedClass ? ferry.selectedClass.price : 0;
                const gst = 0;
                const pmb = 50;
                const total = base + gst + pmb;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.tableRow,
                      idx % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <Text style={[styles.tableCell, { width: "8%" }]}>
                      {idx + 1}
                    </Text>
                    <Text style={[styles.tableCell, { width: "28%" }]}>
                      {p.fullName}
                    </Text>
                    <Text style={[styles.tableCell, { width: "12%" }]}>
                      {seat}
                    </Text>
                    <Text style={[styles.tableCell, { width: "13%" }]}>
                      {formatCurrency(base)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "13%" }]}>
                      {formatCurrency(gst)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "13%" }]}>
                      {formatCurrency(pmb)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { width: "13%", fontWeight: "bold" },
                      ]}
                    >
                      {formatCurrency(total)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.passengerList}>
              {data.passengers.map((p, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.passengerItem,
                    idx % 2 === 1 ? styles.passengerItemAlt : {},
                  ]}
                >
                  <Text style={styles.passengerNumber}>{idx + 1}</Text>
                  <Text style={styles.passengerName}>{p.fullName}</Text>
                  <Text style={styles.passengerInfo}>
                    {p.age}Y • {p.gender} • {p.nationality}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <Text style={styles.cardTextBold}>
                {data.customerInfo.primaryContactName}
              </Text>
              <Text style={styles.cardText}>
                {data.customerInfo.customerEmail}
              </Text>
              <Text style={styles.cardText}>
                {data.customerInfo.customerPhone}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Booking Details</Text>
              <Text style={styles.cardText}>
                Booked: {formatDate(data.bookingDate)}
              </Text>
              <Text style={styles.cardText}>Boarding: Haddo Jetty</Text>
              <Text style={styles.cardText}>
                Endorsement: ANDAMAN EXCURSION
              </Text>
            </View>
          </View>

          <View style={styles.pricingBox}>
            <View style={styles.pricingRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(data.pricing.subtotal)}</Text>
            </View>
            {data.pricing.taxes > 0 && (
              <View style={styles.pricingRow}>
                <Text>Taxes & GST</Text>
                <Text>{formatCurrency(data.pricing.taxes)}</Text>
              </View>
            )}
            {data.pricing.fees > 0 && (
              <View style={styles.pricingRow}>
                <Text>Processing Fees</Text>
                <Text>{formatCurrency(data.pricing.fees)}</Text>
              </View>
            )}
            <View style={styles.pricingTotal}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(data.pricing.totalAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.importantBox}>
            <Text style={styles.importantTitle}>⚠ IMPORTANT</Text>
            <Text style={styles.importantText}>
              • Carry e-ticket with valid photo ID
            </Text>
            <Text style={styles.importantText}>
              • Report 45 min before. Boarding closes 20 min prior
            </Text>
            <Text style={styles.importantText}>
              • Free baggage: 25kg registered
            </Text>
          </View>

          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termItem}>
              • Re-confirm booking 1 day prior. Contact +91-8001240006
              (0900-1700hrs)
            </Text>
            <Text style={styles.termItem}>
              • NAME correction not permitted. Valid photo ID & RTPCR mandatory
            </Text>
            <Text style={styles.termItem}>
              • Cancellation: 48h-Rs.100+Tax | 24h-50%+Tax | &lt;24h-No refund
            </Text>
            <Text style={styles.termItem}>
              • Non-transferable, non-reroutable. LIQUOR & SMOKING prohibited
            </Text>
            <Text style={styles.termItem}>
              • Carrier may cancel/change voyage due to weather/technical
              reasons
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Andaman Excursion | No. 38, New R.K Market, Junglighat, Port Blair |
            +91-9933261956
          </Text>
          <Text style={styles.footerText}>
            Ref: {data.confirmationNumber} | ID: {data.bookingId} | Generated:{" "}
            {new Date().toLocaleString("en-IN")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default BookingTicketPDF;
