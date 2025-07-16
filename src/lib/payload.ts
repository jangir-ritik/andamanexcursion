import { getPayload } from "payload";
import { cache } from "react";
import config from "@payload-config";

// Cache payload instance
export const getCachedPayload = cache(async () => {
  return await getPayload({ config });
});

export async function getPageBySlug(slug: string) {
  const payload = await getCachedPayload();

  const { docs } = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  });

  return docs[0] || null;
}

export async function getAllPages() {
  const payload = await getCachedPayload();

  return await payload.find({
    collection: "pages",
  });
}
