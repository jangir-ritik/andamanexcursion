// app/packages/[category]/page.tsx
import {
  pageService,
  pageDataService,
  packageCategoryService,
} from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import styles from "@/app/(frontend)/packages/page.module.css";

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
  const initialPeriod = period || "all";

  // Get the generic category template page
  const page = await pageService.getBySlug("packages-category-template");

  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    console.error("Generic category template page not found or not published");
    notFound();
  }

  // Fetch category data and package options
  const [data, allCategories] = await Promise.all([
    pageDataService.getCategoryPageData(categorySlug, initialPeriod),
    packageCategoryService.getAll(),
  ]);

  if (!data) {
    notFound();
  }

  // Format package options
  const packageOptions = allCategories.map((category) => ({
    id: category.slug,
    label: category.title?.replace(" Packages", "") || category.title,
  }));

  // Inject dynamic data into blocks
  const enrichedBlocks = page.pageContent.content.map((block) => {
    if (block.blockType === "dynamicCategoryPackages") {
      return {
        ...block,
        // Inject all the dynamic data
        category: data.category,
        packages: data.packages,
        periodOptions: data.periodOptions,
        packageOptions,
        initialPeriod,
      };
    }
    return block;
  });

  return (
    <div className={styles.main}>
      <BlockRenderer blocks={enrichedBlocks as any} />
    </div>
  );
}

// Generate static params for better performance
// export async function generateStaticParams() {
//   try {
//     const categories = await packageCategoryService.getAll();
//     return categories.map((category) => ({
//       category: category.slug,
//     }));
//   } catch (error) {
//     console.error("Error generating static params:", error);
//     return [];
//   }
// }

// // Optional: Add metadata generation
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ category: string }>;
// }) {
//   const { category: categorySlug } = await params;

//   try {
//     const data = await pageDataService.getCategoryPageData(categorySlug);
//     if (!data) return {};

//     return {
//       title: `${data.category.title} | Andaman Excursion`,
//       description:
//         data.category.categoryDetails?.description ||
//         `Browse our ${data.category.title} collection and discover amazing packages in the Andaman Islands.`,
//       keywords: [
//         data.category.title,
//         "Andaman Islands",
//         "packages",
//         "travel",
//         "tourism",
//       ],
//       openGraph: {
//         title: `${data.category.title} | Andaman Excursion`,
//         description:
//           data.category.categoryDetails?.description ||
//           `Browse our ${data.category.title} collection`,
//         type: "website",
//       },
//     };
//   } catch (error) {
//     console.error("Error generating metadata:", error);
//     return {};
//   }
// }
