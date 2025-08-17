import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ValidatedEnquiryData } from "@/types/enquiry.types";
import {
  decodePackageDataFromURL,
  getContactFormDefaults,
} from "@/utils/enquiry.utils";
import { useContactFormOptions } from "./useContactFormOptions";

/**
 * Custom hook to handle package enquiry data from URL parameters
 * Provides decoded package data and form defaults for the contact form
 */
export function useEnquiryData() {
  const searchParams = useSearchParams();
  const contactFormOptions = useContactFormOptions();
  const [enquiryData, setEnquiryData] = useState<ValidatedEnquiryData>({
    isValid: false,
    source: "none",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const packageParam = searchParams?.get("pkg");
    const referrer = searchParams?.get("ref");

    if (packageParam) {
      try {
        const decoded = decodePackageDataFromURL(packageParam);
        setEnquiryData(decoded);

        // Analytics or logging could go here
        if (decoded.isValid && referrer) {
          console.log(
            `Enquiry from ${referrer} for package: ${decoded.packageTitle}`
          );
        }
      } catch (error) {
        console.error("Error processing enquiry data:", error);
        setEnquiryData({ isValid: false, source: "none" });
      }
    } else {
      setEnquiryData({ isValid: false, source: "none" });
    }

    setIsLoading(false);
  }, [searchParams]);

  // Generate form defaults based on enquiry data and available options
  const formDefaults = useMemo(() => {
    const defaults = getContactFormDefaults(enquiryData, contactFormOptions);

    // Debug logging (only once when package data is ready)
    if (
      enquiryData.isValid &&
      defaults.booking.package &&
      contactFormOptions?.packages?.length > 0
    ) {
      console.log("✅ Package enquiry processed:", {
        package: defaults.booking.package,
        duration: defaults.booking.duration,
        title: enquiryData.packageTitle,
      });
    }

    return defaults;
  }, [
    enquiryData.packageId, // More specific dependency
    enquiryData.periodId,
    contactFormOptions?.packages?.length, // Avoid full object comparison
    contactFormOptions?.periods?.length,
  ]);

  // Helper to check if we have valid package data
  const hasPackageData = enquiryData.isValid && enquiryData.source === "url";

  // Package display information for UI
  const packageInfo = hasPackageData
    ? {
        title: enquiryData.packageTitle,
        period: enquiryData.periodTitle,
        price: enquiryData.price,
        originalPrice: enquiryData.originalPrice,
        description: enquiryData.shortDescription,
      }
    : null;

  // Check if the enquiry data matches available options
  const isEnquiryDataValid =
    hasPackageData && contactFormOptions.packages.length > 0
      ? contactFormOptions.getPackageBySlug(enquiryData.packageSlug || "") !==
        undefined
      : hasPackageData;

  return {
    enquiryData,
    formDefaults,
    isLoading: isLoading || contactFormOptions.isLoading,
    hasPackageData: isEnquiryDataValid,
    packageInfo,
    contactFormOptions,
  };
}
