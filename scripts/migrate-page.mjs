// Migration script to transform existing pages data to new structure - ES Module version
// Run this script after deploying the new collection structure
// Usage: node migrate-pages.mjs

import { MongoClient } from "mongodb";

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  mongoUri:
    "mongodb+srv://admin:admin@cluster0.vbbbx5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", // Update with your MongoDB connection string
  databaseName: "test", // Update with your database name
  collectionName: "pages", // Usually 'pages' unless you changed it
};

async function migratePagesCollection() {
  const client = new MongoClient(CONFIG.mongoUri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(CONFIG.databaseName);
    const collection = db.collection(CONFIG.collectionName);

    // Get all existing pages
    const pages = await collection.find({}).toArray();

    console.log(`Found ${pages.length} pages to migrate`);

    if (pages.length === 0) {
      console.log("No pages found to migrate");
      return;
    }

    // Create a backup collection first
    const backupCollectionName = `${CONFIG.collectionName}_backup_${Date.now()}`;
    const backupCollection = db.collection(backupCollectionName);
    await backupCollection.insertMany(pages);
    console.log(`Backup created: ${backupCollectionName}`);

    // Transform each page
    const transformedPages = pages.map((page) => {
      const transformed = {
        ...page,
        // Group basic information
        basicInfo: {
          title: page.title,
          slug: page.slug,
          pageType: page.pageType || "home",
        },

        // Group SEO fields (matching your seoFields structure)
        seo: {
          metaTitle: page.seo?.metaTitle || page.metaTitle || "",
          metaDescription:
            page.seo?.metaDescription || page.metaDescription || "",
          metaImage: page.seo?.metaImage || page.metaImage || null,
        },

        // Group content
        pageContent: {
          content: page.content || [],
        },

        // Group publishing settings
        publishingSettings: {
          status: page.status || "draft",
          publishedAt: page.publishedAt || page.createdAt,
          featuredImage: page.featuredImage || null,
        },
      };

      // Remove old flat fields to avoid duplication
      delete transformed.title;
      delete transformed.slug;
      delete transformed.pageType;
      delete transformed.content;
      // Handle SEO fields (they might already be grouped or flat)
      if (page.seo) {
        delete transformed.seo; // Will be replaced with new structure
      }
      // Remove any flat SEO fields if they exist
      delete transformed.metaTitle;
      delete transformed.metaDescription;
      delete transformed.metaImage;
      delete transformed.status;
      delete transformed.publishedAt;
      delete transformed.featuredImage;

      return transformed;
    });

    // Update all documents
    let updated = 0;
    for (const page of transformedPages) {
      await collection.replaceOne({ _id: page._id }, page);
      updated++;

      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${pages.length} pages...`);
      }
    }

    console.log(`Migration completed successfully. Updated ${updated} pages.`);
    console.log(`Backup collection: ${backupCollectionName}`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Execute migration
console.log("Starting migration...");
console.log("Config:", CONFIG);

migratePagesCollection()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration script failed:", err);
    process.exit(1);
  });
