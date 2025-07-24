import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function Home({ params }: PageProps) {
  // Use 'home' as default slug for the homepage
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "home";

  const page = await pageService.getBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
}
