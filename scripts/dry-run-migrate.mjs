// DRY RUN Migration script - shows what would happen without making changes
// Usage: node dry-run-migrate.js

import { MongoClient } from "mongodb";

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  mongoUri:
    "mongodb+srv://admin:admin@cluster0.vbbbx5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", // Update with your MongoDB connection string
  databaseName: "test", // Update with your database name
  collectionName: "pages", // Usually 'pages' unless you changed it
};

async function dryRunMigration() {
  const client = new MongoClient(CONFIG.mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(CONFIG.databaseName);
    const collection = db.collection(CONFIG.collectionName);

    // Get all existing pages
    const pages = await collection.find({}).toArray();

    console.log(`Found ${pages.length} pages to migrate`);
    console.log("\n--- DRY RUN - NO CHANGES WILL BE MADE ---\n");

    if (pages.length === 0) {
      console.log("No pages found to migrate");
      return;
    }

    // Show first page structure
    console.log("Current structure (first page):");
    console.log(JSON.stringify(pages[0], null, 2));

    // Transform first page as example
    const firstPage = pages[0];
    const transformed = {
      ...firstPage,
      basicInfo: {
        title: firstPage.title,
        slug: firstPage.slug,
        pageType: firstPage.pageType || "home",
      },
      seo: {
        metaTitle: firstPage.seo?.metaTitle || firstPage.metaTitle || "",
        metaDescription:
          firstPage.seo?.metaDescription || firstPage.metaDescription || "",
        metaImage: firstPage.seo?.metaImage || firstPage.metaImage || null,
      },
      pageContent: {
        content: firstPage.content || [],
      },
      publishingSettings: {
        status: firstPage.status || "draft",
        publishedAt: firstPage.publishedAt || firstPage.createdAt,
        featuredImage: firstPage.featuredImage || null,
      },
    };

    // Remove old flat fields
    delete transformed.title;
    delete transformed.slug;
    delete transformed.pageType;
    delete transformed.content;
    // Handle SEO fields (they might already be grouped or flat)
    if (firstPage.seo) {
      delete transformed.seo; // Will be replaced with new structure
    }
    // Remove any flat SEO fields if they exist
    delete transformed.metaTitle;
    delete transformed.metaDescription;
    delete transformed.metaImage;
    delete transformed.status;
    delete transformed.publishedAt;
    delete transformed.featuredImage;

    console.log("\n--- TRANSFORMED STRUCTURE (example) ---\n");
    console.log(JSON.stringify(transformed, null, 2));

    console.log("\n--- SUMMARY ---");
    console.log(`Pages to migrate: ${pages.length}`);
    console.log("Fields that will be grouped:");
    console.log("- basicInfo: title, slug, pageType");
    console.log("- seo: metaTitle, metaDescription, metaImage");
    console.log("- pageContent: content");
    console.log("- publishingSettings: status, publishedAt, featuredImage");

    console.log("\nTo run actual migration, use: node migrate-pages.js");
  } catch (error) {
    console.error("Dry run failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Execute dry run
console.log("Starting dry run...");
dryRunMigration()
  .then(() => {
    console.log("Dry run completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Dry run failed:", err);
    process.exit(1);
  });
