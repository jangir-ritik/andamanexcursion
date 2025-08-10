import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";

import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { slug: destinationSlug } = await params;

  const page = await pageService.getBySlug(destinationSlug);

  if (!page) {
    return notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}
