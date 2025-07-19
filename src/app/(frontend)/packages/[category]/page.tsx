import React from "react";
import { notFound } from "next/navigation";
import {
  getPackageCategoryBySlug,
  getPackagesByCategory,
  getPackagesPageData,
} from "@/lib/payload";
import { CategoryPageClient } from "./CategoryPageClient";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ period?: string }>;
}

// import { Section, Column } from "@/components/layout";
// import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
// import { FeaturePackageCard } from "@/components/molecules/Cards";

// import { usePackageCategoryPage } from "@/hooks/usePackageCategoryPage";

// import styles from "../page.module.css";
// import { packageOptions, periodOptions } from "../page.content";
// import { SectionTitle } from "@/components/atoms";

// export default function CategoryPage() {
//   const {
//     selectedPackage,
//     selectedPeriod,
//     category,
//     packages,
//     handlePackageChange,
//     handlePeriodChange,
//     getCategoryTitle,
//     formatDuration,
//   } = usePackageCategoryPage();

//   return (
//     <main className={styles.main}>
//       <Section>
//         <Column
//           gap={3}
//           justifyContent="start"
//           alignItems="start"
//           fullWidth
//           className={styles.packageSelectorWrapper}
//           style={{ minHeight: "150px" }}
//         >
//           <SectionTitle text="Chosen Package" />
//           <PackageSelector
//             packageOptions={packageOptions}
//             periodOptions={periodOptions}
//             onPackageChange={handlePackageChange}
//             onPeriodChange={handlePeriodChange}
//             defaultPackage={selectedPackage}
//             defaultPeriod={selectedPeriod}
//           />
//         </Column>
//       </Section>
//       <Section>
//         <Column
//           gap={7}
//           fullWidth
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <Column
//             alignItems="start"
//             justifyContent="start"
//             gap={3}
//             fullWidth
//             responsive
//             responsiveGap="var(--space-4)"
//           >
//             <SectionTitle
//               text={getCategoryTitle(category) + " Packages"}
//               specialWord={getCategoryTitle(category)}
//               className={styles.sectionTitle}
//             />
//             {packages.map((pkg) => (
//               <FeaturePackageCard
//                 key={pkg.id}
//                 title={pkg.title}
//                 description={pkg.description}
//                 price={pkg.price}
//                 location={pkg.location}
//                 duration={formatDuration(pkg.period)}
//                 image={pkg.images[0]}
//                 href={`/packages/${category}/${pkg.id}`}
//               />
//             ))}
//           </Column>
//         </Column>
//       </Section>
//     </main>
//   );
// }

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { period } = await searchParams;

  // Fetch category data
  const category = await getPackageCategoryBySlug(categorySlug);
  if (!category) notFound();

  // Fetch packages for this category
  const packages = await getPackagesByCategory(categorySlug);

  // Get selector options
  const { packageOptions, periodOptions } = await getPackagesPageData();

  return (
    <CategoryPageClient
      category={category}
      packages={packages}
      packageOptions={packageOptions}
      periodOptions={periodOptions}
      initialPeriod={period}
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
