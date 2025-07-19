import React from "react";
import { notFound } from "next/navigation";
import {
  getPackageCategoryBySlug,
  getPackagesByFilters,
  getPackagesPageData,
} from "@/lib/payload";
import { CategoryPageClient } from "./CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { period } = await searchParams;

  // Fetch category data
  const category = await getPackageCategoryBySlug(categorySlug);
  if (!category) notFound();

  console.log("URL period param:", period);

  // Fetch packages for this category with optional period filter
  const packages = await getPackagesByFilters({
    categorySlug,
    // Only pass period if it's not 'all' and not undefined
    period: period && period !== "all" ? period : undefined,
  });

  // Get selector options
  const { packageOptions, periodOptions } = await getPackagesPageData();

  return (
    <CategoryPageClient
      category={category}
      packages={packages}
      packageOptions={packageOptions}
      periodOptions={periodOptions}
      initialPeriod={period || "all"}
    />
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  // Pre-generate pages for each category
  return [
    { category: "honeymoon" },
    { category: "family" },
    { category: "romantic" },
  ];
}
