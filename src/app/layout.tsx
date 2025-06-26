import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import "./globals.css";
import "@/styles/variables.css";
import { Header } from "@/components/Header/Header";

export const metadata: Metadata = {
  title: "Andaman Excursion",
  description: "Andaman Excursion",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const quickBeach = localFont({
  src: "../../public/fonts/quick-beach.otf",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(plusJakartaSans.className, quickBeach.className)}>
        <Header />
        {children}
      </body>
    </html>
  );
}
