// layout.tsx - Updated font configuration for Safari compatibility
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import "./globals.css";
import "@/styles/variables.css";
import { Header } from "@/components/organisms/Header/Header";
import { Footer } from "@/components/organisms/Footer";
import { Column, Container } from "@/components/layout";
import { PackageProvider } from "@/context/PackageContext";

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

// Updated Quick Beach font configuration with WOFF2 for Safari compatibility
const quickBeach = localFont({
  src: [
    {
      path: "../../public/fonts/quick-beach.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-quick-beach", // Add CSS variable
  display: "swap",
  preload: true, // Ensure font is preloaded
  fallback: ["cursive", "fantasy", "serif"], // Better fallback chain
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <link
          rel="preload"
          href="/fonts/quick-beach-italic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={clsx(plusJakartaSans.className, quickBeach.className)}>
        <PackageProvider>
          <Header />
          <Container>
            <Column gap="var(--section-gap)" fullWidth>
              {children}
            </Column>
          </Container>
          <Footer />
        </PackageProvider>
      </body>
    </html>
  );
}
