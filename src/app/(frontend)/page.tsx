import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { getPageBySlug } from "@/lib/payload";
import { notFound } from "next/navigation";

export default async function Home() {
  const page = await getPageBySlug("home");
  // console.log(page);

  if (!page || !page.content) {
    notFound();
  }
  return <BlockRenderer blocks={page.content} />;
}
