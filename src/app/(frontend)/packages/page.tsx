import React from "react";
import { pageService, pageDataService } from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { PackagesPageClient } from "./PackagesPageClient";
import styles from "./page.module.css";

export default async function PackagesPage() {
  // Get page content from Payload CMS
  const page = await pageService.getBySlug("packages");

  // Check if the page exists and is published
  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    notFound();
  }

  // Server-side data fetching for dynamic packages section
  const { packageOptions, periodOptions, packageCategoriesContent } =
    await pageDataService.getPackagesPageData();

  // Find the dynamic packages block and inject the data
  const enrichedBlocks = page.pageContent.content.map((block) => {
    if (block.blockType === "dynamicPackages") {
      return {
        ...block,
        // Inject the fetched data into the block content
        packageOptions,
        periodOptions,
        packageCategoriesContent,
      };
    }
    return block;
  });

  return (
    <div className={styles.main}>
      {/* Render static content blocks */}
      <BlockRenderer blocks={enrichedBlocks} />

      {/* Client-side component for URL param handling */}
      <PackagesPageClient />
    </div>
  );
}
