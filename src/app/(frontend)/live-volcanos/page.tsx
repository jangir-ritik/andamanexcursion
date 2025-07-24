import React from "react";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function LiveVolcanosPage({ params }: PageProps) {
  const page = await pageService.getBySlug("live-volcanos");

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}
