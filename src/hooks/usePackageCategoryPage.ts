import { useEffect } from "react";
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

  // Set the selected package to match the category when page loads
  useEffect(() => {
    const mappedPackage =
      categoryToPackageMap[category as keyof typeof categoryToPackageMap];
    if (mappedPackage && mappedPackage !== selectedPackage) {
      setSelectedPackage(mappedPackage);
    }
  }, [category, selectedPackage, setSelectedPackage]);

  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);

    // Navigate to the appropriate category page based on package selection
    if (packageId !== "all" && packageId in packageToCategoryMap) {
      const newCategory =
        packageToCategoryMap[packageId as keyof typeof packageToCategoryMap];
      if (newCategory !== category) {
        router.push(`/packages/${newCategory}`);
      }
    }
  };

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
  };

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
