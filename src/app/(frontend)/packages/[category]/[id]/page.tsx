// import React from "react";
// import { Section, Column, Row } from "@/components/layout";
// import { InlineLink, Button, EnquireButton } from "@/components/atoms";
// import { pageDataService } from "@/services/payload";
// import { notFound } from "next/navigation";

// import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
// import styles from "../../page.module.css";
// import { Testimonials } from "@/components/sectionBlocks/common/testimonials/Testimonials";
// import { LargeCardSection } from "@/components/sectionBlocks/common";
// import { PackageDetailTabs } from "@/components/organisms";
// import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
// import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";
// // import {
// //   packagesPageFAQContent,
// //   testimonials,
// //   largeCardSectionContent,
// // } from "../../page.content";

// interface PackageDetailPageProps {
//   params: Promise<{
//     category: string;
//     id: string;
//   }>;
// }

// export default async function PackageDetailPage({
//   params,
// }: PackageDetailPageProps) {
//   const { category, id } = await params;

//   // Get package data from API
//   const result = await pageDataService.getPackageDetailPageData(category, id);

//   if (!result || !result.packageData) {
//     notFound();
//   }

//   // Get the original package data object - this contains all Payload CMS fields
//   const packageData = result.packageData as PayloadPackage;

//   return (
//     <main className={styles.main}>
//       <Section className={styles.packageDetailSection}>
//         <Column
//           fullWidth
//           gap={5}
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <PackageDetailHeader packageData={packageData} />
//           {/* Package Detail Tabs */}
//           <PackageDetailTabs packageData={packageData} />
//           <Row gap={3} responsive responsiveGap="var(--space-4)">
//             {/* <InlineLink href="/customise">Customise this package</InlineLink> */}
//             <EnquireButton packageData={packageData}>Enquire</EnquireButton>
//           </Row>
//         </Column>
//       </Section>
//       {/* <FAQ content={packagesPageFAQContent} />
//       <Testimonials content={testimonials} />
//       <LargeCardSection content={largeCardSectionContent} /> */}
//     </main>
//   );
// }

// // Generate static params for better performance
// export async function generateStaticParams() {
//   // In a real implementation, you would fetch all categories and packages
//   // For now, we'll return an empty array since this is just a placeholder
//   return [];
// }

// // Add metadata generation
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ category: string; id: string }>;
// }) {
//   const { category, id } = await params;
//   const result = await pageDataService.getPackageDetailPageData(category, id);

//   if (!result || !result.packageData) {
//     return {
//       title: "Package Not Found",
//       description: "The requested package does not exist.",
//     };
//   }

//   const packageData = result.packageData as PayloadPackage;

//   return {
//     title: `${packageData.title} | Andaman Excursion`,
//     description:
//       packageData.descriptions?.shortDescription ||
//       packageData.descriptions?.description ||
//       `${packageData.title} - Book Now`,
//   };
// }
import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { EnquireButton } from "@/components/atoms";
import { pageService, pageDataService } from "@/services/payload";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import { PackageDetailTabs } from "@/components/organisms";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
interface PackageDetailPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { category, id } = await params;

  // Get package data from API
  const result = await pageDataService.getPackageDetailPageData(category, id);
  if (!result || !result.packageData) {
    notFound();
  }

  // Get the original package data object - this contains all Payload CMS fields
  const packageData = result.packageData as PayloadPackage;

  // Get the package page from CMS for additional blocks
  let packagePage = null;
  try {
    // Try to get package-specific page, fallback to generic template
    packagePage =
      (await pageService.getBySlug(`package-${id}`)) ||
      (await pageService.getBySlug("package-detail-template"));
  } catch (error) {
    console.error("Error fetching package page:", error);
  }

  // Prepare enriched blocks if page content exists
  const enrichedBlocks = packagePage?.pageContent?.content
    ? packagePage.pageContent.content.map((block) => {
        // Inject package data into blocks that might need it
        return {
          ...block,
          packageData, // Make package data available to all blocks
        };
      })
    : [];

  return (
    <main className={styles.main}>
      <Section className={styles.packageDetailSection}>
        <Column
          fullWidth
          gap={5}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <PackageDetailHeader packageData={packageData} />
          {/* Package Detail Tabs */}
          <PackageDetailTabs packageData={packageData} />
          <Row gap={3} responsive responsiveGap="var(--space-4)">
            {/* <InlineLink href="/customise">Customise this package</InlineLink> */}
            <EnquireButton packageData={packageData}>Enquire</EnquireButton>
          </Row>
        </Column>
      </Section>

      {/* Render additional CMS blocks if they exist */}
      {enrichedBlocks.length > 0 && (
        <BlockRenderer blocks={enrichedBlocks as any} />
      )}
    </main>
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  // In a real implementation, you would fetch all categories and packages
  // For now, we'll return an empty array since this is just a placeholder
  return [];
}

// Add metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const result = await pageDataService.getPackageDetailPageData(category, id);
  if (!result || !result.packageData) {
    return {
      title: "Package Not Found",
      description: "The requested package does not exist.",
    };
  }
  const packageData = result.packageData as PayloadPackage;
  return {
    title: `${packageData.title} | Andaman Excursion`,
    description:
      packageData.descriptions?.shortDescription ||
      packageData.descriptions?.description ||
      `${packageData.title} - Book Now`,
  };
}
