import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { getAllPages, getPageBySlug } from "@/lib/payload";
import { notFound } from "next/navigation";

type PageProps = {
  params?: { slug?: string };
};

export default async function Home({ params }: PageProps) {
  // Use 'home' as default slug for the homepage
  const slug = params?.slug || "home";

  const page = await getPageBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
}
