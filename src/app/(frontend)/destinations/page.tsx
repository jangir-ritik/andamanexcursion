import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";

// This is the index page at /destinations
export default async function DestinationsIndexPage() {
  // Try to find the destinations index page
  const page = await pageService.getDestinationsIndex();

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
// export async function generateMetadata() {
//   const page = await pageService.getDestinationsIndex();

//   if (!page) {
//     return {
//       title: "Destinations",
//       description: "Explore amazing destinations in the Andaman Islands",
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
