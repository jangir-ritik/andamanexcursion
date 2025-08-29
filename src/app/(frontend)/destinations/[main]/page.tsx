import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound, redirect } from "next/navigation";

import styles from "./page.module.css";
import { pageService } from "@/services/payload";

interface PageProps {
  params: Promise<{ main: string }>;
}

export default async function MainDestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { main: mainCategorySlug } = await params;

  // First try to find a main destination page by mainCategorySlug
  let page = await pageService.getMainDestinationBySlug(mainCategorySlug);

  // If not found, check for legacy single-slug destinations and redirect
  if (!page) {
    // Try to find by the old slug method for backward compatibility
    const legacyPage = await pageService.getBySlug(mainCategorySlug);

    if (
      legacyPage &&
      legacyPage.basicInfo?.pageType === "destinations" &&
      legacyPage.destinationInfo
    ) {
      const {
        destinationType,
        mainCategorySlug: newMainSlug,
        subcategorySlug,
        parentMainCategory,
      } = legacyPage.destinationInfo;

      if (
        destinationType === "main" &&
        newMainSlug &&
        newMainSlug !== mainCategorySlug
      ) {
        // Redirect to new main category URL
        redirect(`/destinations/${newMainSlug}`);
      } else if (
        destinationType === "sub" &&
        subcategorySlug &&
        parentMainCategory
      ) {
        // Get the main category slug for redirection
        let parentSlug = null;
        if (
          typeof parentMainCategory === "object" &&
          parentMainCategory.destinationInfo?.mainCategorySlug
        ) {
          parentSlug = parentMainCategory.destinationInfo.mainCategorySlug;
        } else if (typeof parentMainCategory === "string") {
          const parentPage = await pageService.getById(parentMainCategory);
          parentSlug = parentPage?.destinationInfo?.mainCategorySlug;
        }

        if (parentSlug) {
          redirect(`/destinations/${parentSlug}/${subcategorySlug}`);
        }
      }

      // If it's a legacy destination but doesn't have new structure, render it
      page = legacyPage;
    }
  }

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
//   const { main: mainCategorySlug } = await params;
//   const page = await pageService.getMainDestinationBySlug(mainCategorySlug);

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
