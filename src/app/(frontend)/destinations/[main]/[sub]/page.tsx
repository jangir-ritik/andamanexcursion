import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";

interface PageProps {
  params: Promise<{ main: string; sub: string }>;
}

// This is the sub destination page at /destinations/[main]/[sub]
export default async function SubDestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { main: mainCategorySlug, sub: subcategorySlug } = await params;

  // Try to find a sub-destination page by mainCategorySlug and subcategorySlug
  const page = await pageService.getSubDestinationBySlug(
    mainCategorySlug,
    subcategorySlug
  );

  if (!page) {
    return notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}

// Generate metadata for the page
// export async function generateMetadata({ params }: PageProps) {
//   const { main: mainCategorySlug, sub: subcategorySlug } = await params;

//   const page = await pageService.getSubDestinationBySlug(
//     mainCategorySlug,
//     subcategorySlug
//   );

//   if (!page) {
//     return {
//       title: "Destination Not Found",
//     };
//   }

//   return {
//     title: page.seoMeta?.metaTitle || page.title,
//     description: page.seoMeta?.metaDescription,
//     openGraph: {
//       title: page.seoMeta?.metaTitle || page.title,
//       description: page.seoMeta?.metaDescription,
//       images: page.seoMeta?.metaImage ? [page.seoMeta.metaImage] : [],
//     },
//   };
// }
