// Using server client split pattern
// This is the server component

import React from "react";
import { getPackagesPageData, getPageBySlug } from "@/lib/payload";
import { PackagesPageClient } from "./PackagesPageClient";

import { testimonials } from "./page.content";
import { notFound } from "next/navigation";

export default async function PackagesPage() {
  // For the main packages page, no slug is needed/expected
  const page = await getPageBySlug("packages");

  // Check if the page exists and is published
  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    notFound();
  }

  // Extract FAQ content
  const faqContent = page.pageContent.content.find(
    (block) => block.blockType === "faq"
  );

  // Extract largeCard content
  const largeCardSectionContent = page.pageContent.content.find(
    (block) => block.blockType === "largeCard"
  );

  // Server-side data fetching
  const { packageOptions, periodOptions, packageCategoriesContent } =
    await getPackagesPageData();

  return (
    <PackagesPageClient
      packageOptions={packageOptions}
      periodOptions={periodOptions}
      packageCategoriesContent={packageCategoriesContent}
      faqContent={faqContent || null}
      testimonials={testimonials}
      largeCardSectionContent={largeCardSectionContent || null}
    />
  );
}
