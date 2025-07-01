import { useEffect, useCallback } from "react";
import { usePackageContext } from "@/context/PackageContext";
import { useParams, useRouter } from "next/navigation";
import {
  categoryToPackageMap,
  packageToCategoryMap,
} from "@/app/packages/page.content";
import {
  getPackagesByCategory,
  getFilteredPackages,
  Package,
} from "@/data/packages";

export const usePackageCategoryPage = () => {
  const {
    selectedPackage,
    selectedPeriod,
    setSelectedPackage,
    setSelectedPeriod,
  } = usePackageContext();
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  // Map URL category to data category
  const categoryMap: { [key: string]: string } = {
    "honeymoon-retreat": "honeymoon",
    "family-tours": "family",
    "best-sellers": "best",
  };

  const dataCategory = categoryMap[category] || "honeymoon";

  // Set the selected package to match the category when page loads or category changes
  useEffect(() => {
    const mappedPackage =
      categoryToPackageMap[category as keyof typeof categoryToPackageMap];

    if (mappedPackage) {
      // Use setTimeout to ensure this runs after the current execution context
      setTimeout(() => {
        setSelectedPackage(mappedPackage);
      }, 0);
    }
  }, [category, setSelectedPackage]);

  // Memoize the handler to prevent recreating it on each render
  const handlePackageChange = useCallback(
    (packageId: string) => {
      // First update the state
      setSelectedPackage(packageId);

      // Then navigate if needed
      if (packageId !== "all" && packageId in packageToCategoryMap) {
        const newCategory =
          packageToCategoryMap[packageId as keyof typeof packageToCategoryMap];

        if (newCategory !== category) {
          // Use setTimeout to ensure state is updated before navigation
          setTimeout(() => {
            router.push(`/packages/${newCategory}`);
          }, 0);
        }
      }
    },
    [category, router, setSelectedPackage]
  );

  const handlePeriodChange = useCallback(
    (periodId: string) => {
      setSelectedPeriod(periodId);
    },
    [setSelectedPeriod]
  );

  // Filter packages by both category and period
  const packages: Package[] =
    selectedPeriod === "all"
      ? getPackagesByCategory(dataCategory)
      : getFilteredPackages(dataCategory, selectedPeriod);

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      "honeymoon-retreat": "Honeymoon",
      "family-tours": "Family",
      "best-sellers": "Best",
    };
    return titles[category] || "Our";
  };

  const formatDuration = (period: string) => {
    const [days, nights] = period.split("-");
    return `${days}D ${nights}N`;
  };

  return {
    selectedPackage,
    selectedPeriod,
    category,
    packages,
    handlePackageChange,
    handlePeriodChange,
    getCategoryTitle,
    formatDuration,
  };
};
