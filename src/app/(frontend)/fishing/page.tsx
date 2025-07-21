import React from "react";
import styles from "./page.module.css";
import { getPageBySlug } from "@/lib/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";

export default async function FishingPage() {
  const page = await getPageBySlug("fishing");

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}
