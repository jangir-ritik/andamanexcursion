// layout.tsx - Simplified with automatic loading bar
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import "./globals.css";
import "@/styles/variables.css";
// import { BookingProviders } from "@/context/BookingProviders";
import { TopLoadingBarProvider } from "@/components/layout/TopLoadingBarProvider/TopLoadingBarProvider";
import { Footer, Header } from "@/components/organisms";
import { Column, Container } from "@/components/layout";
import { PageBackgroundProvider } from "@/components/atoms/PageBackgroundProvider/PageBackgroundProvider";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";
import { locationService } from "@/services/payload/collections/locations";
import { timeSlotService } from "@/services/payload/collections/time-slots";
import { activityService } from "@/services/payload/collections/activities";
// Consolidated to Zustand; Context removed
import { getNavigationData } from "@/utils/getNavigationData";
// import { BookingDataProvider } from "@/context/BookingDataProvider";

export const metadata: Metadata = {
  title: "Andaman Excursion | Explore the Andaman Islands",
  description:
    "Discover pristine beaches, hidden adventures, and unforgettable experiences across the Andaman Islands with our perfectly designed travel packages.",
  keywords: [
    "Andaman Islands",
    "travel packages",
    "island vacation",
    "beach holiday",
    "scuba diving",
    "Andaman tourism",
  ],
  openGraph: {
    title: "Andaman Excursion | Explore the Andaman Islands",
    description:
      "Discover pristine beaches, hidden adventures, and unforgettable experiences across the Andaman Islands with our perfectly designed travel packages.",
    url: "https://andamanexcursion.com",
    siteName: "Andaman Excursion",
    locale: "en_US",
    type: "website",
  },
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const quickBeach = localFont({
  src: [
    {
      path: "../../../public/fonts/quick-beach.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-quick-beach",
  display: "swap",
  preload: true,
  fallback: ["cursive", "fantasy", "serif"],
});

// Server component that fetches the data
async function fetchBookingData() {
  try {
    // Fetch locations for activities - using direct Payload API
    const locations = await locationService.getActivityLocations();

    // Fetch time slots for activities and ferries - using direct Payload API
    const activityTimeSlots = await timeSlotService.getForActivities();
    const ferryTimeSlots = await timeSlotService.getForFerries();

    // Fetch activities data - using direct Payload API
    const activities = await activityService.getAll();

    return {
      locations,
      activityTimeSlots,
      ferryTimeSlots,
      activities,
    };
  } catch (error) {
    console.error("Error prefetching booking data:", error);
    return {
      locations: [],
      activityTimeSlots: [],
      ferryTimeSlots: [],
      activities: [],
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch data server-side
  const bookingData = await fetchBookingData();
  const navItems = await getNavigationData(); // get navigation data from payload

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.className} ${quickBeach.variable}`}
    >
      <head>
        {/* Preload critical fonts for Safari */}
        <link
          rel="preload"
          href="/fonts/quick-beach.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={clsx(plusJakartaSans.className, quickBeach.className)}>
        <TopLoadingBarProvider>
          <ReactQueryProvider>
            {/* <BookingDataProvider initialData={bookingData}> */}
            {/* <BookingProviders> */}
            <Header navItems={navItems} />
            <PageBackgroundProvider>
              <Container>
                <Column gap="var(--space-section)" fullWidth>
                  {children}
                </Column>
              </Container>
            </PageBackgroundProvider>
            <Footer />
            {/* </BookingProviders> */}
            {/* </BookingDataProvider> */}
          </ReactQueryProvider>
        </TopLoadingBarProvider>
      </body>
    </html>
  );
}
