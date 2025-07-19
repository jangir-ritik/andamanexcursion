// app/packages/[category]/page.tsx
import { getCategoryPageData, getPackageCategories } from "@/lib/payload";
import { CategoryPageClient } from "./CategoryPageClient";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // Await the promises
  const { category: categorySlug } = await params;
  const { period } = await searchParams;

  // Get the initial period from search params
  const initialPeriod = period || "all";

  // Fetch category data and package options in parallel
  const [data, allCategories] = await Promise.all([
    getCategoryPageData(categorySlug, initialPeriod),
    getPackageCategories(),
  ]);

  if (!data) {
    notFound();
  }

  // Format package options for the selector
  const packageOptions = allCategories.map((category) => ({
    id: category.slug,
    label: category.title?.replace(" Packages", "") || category.title,
  }));

  return (
    <CategoryPageClient
      category={data.category}
      packages={data.packages}
      periodOptions={data.periodOptions}
      packageOptions={packageOptions}
      initialPeriod={initialPeriod}
    />
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const categories = await getPackageCategories();
    return categories.map((category) => ({
      category: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Optional: Add metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  try {
    const data = await getCategoryPageData(categorySlug);
    if (!data) return {};

    return {
      title: `${data.category.title} | Your Site Name`,
      description:
        data.category.categoryDetails?.description ||
        `Browse our ${data.category.title} collection`,
    };
  } catch (error) {
    return {};
  }
}
