import React from "react";
import { pageService, pageDataService } from "@/services/payload";
import { PackagesPageClient } from "./PackagesPageClient";

// import { testimonials } from "./page.content";
import { notFound } from "next/navigation";

export default async function PackagesPage() {
  // For the main packages page, no slug is needed/expected
  const page = await pageService.getBySlug("packages");

  // Check if the page exists and is published
  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    notFound();
  }

  // // Extract FAQ content
  // const faqContent = page.pageContent.content.find(
  //   (block) => block.blockType === "faq"
  // );

  // Extract largeCard content
  const largeCardSectionContent = page.pageContent.content.find(
    (block) => block.blockType === "largeCard"
  );

  // Server-side data fetching
  const { packageOptions, periodOptions, packageCategoriesContent } =
    await pageDataService.getPackagesPageData();

  return (
    <PackagesPageClient
      packageOptions={packageOptions}
      periodOptions={periodOptions}
      packageCategoriesContent={packageCategoriesContent}
      faqContent={null}
      testimonials={null}
      largeCardSectionContent={null}
    />
  );
}
