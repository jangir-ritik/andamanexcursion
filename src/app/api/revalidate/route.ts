import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// Security: Use a secret token to prevent unauthorized revalidation
const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    // Debug logging - REMOVE THESE AFTER TESTING
    console.log("🔍 Environment check:", {
      hasSecret: !!process.env.REVALIDATION_SECRET,
      secretLength: process.env.REVALIDATION_SECRET?.length || 0,
      secretPreview: process.env.REVALIDATION_SECRET?.substring(0, 10) + "...",
    });

    // Verify the secret token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("🔍 Auth check:", {
      hasAuthHeader: !!authHeader,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 10) + "...",
      matches: token === REVALIDATION_SECRET,
    });

    if (token !== REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { collection, slug, operation, doc, paths = [], tags = [] } = body;

    console.log("🔄 Revalidation triggered:", {
      collection,
      slug,
      operation,
      docId: doc?.id,
      paths,
      tags,
    });

    // Revalidate specific paths if provided
    if (paths.length > 0) {
      for (const path of paths) {
        await revalidatePath(path);
        console.log(`✅ Revalidated path: ${path}`);
      }
    }

    // Revalidate specific tags if provided
    if (tags.length > 0) {
      for (const tag of tags) {
        await revalidateTag(tag);
        console.log(`✅ Revalidated tag: ${tag}`);
      }
    }

    // Collection-specific revalidation logic
    switch (collection) {
      case "media":
        await revalidatePath("/", "layout");
        await revalidateTag("media");
        break;
      case "pages":
        if (doc?.slug) {
          await revalidatePath(`/${doc.slug}`);
        }
        await revalidatePath("/");
        await revalidateTag("pages");
        break;
      case "packages":
        await revalidatePath("/packages");
        if (doc?.slug) {
          await revalidatePath(`/packages/${doc.slug}`);
        }
        await revalidateTag("packages");
        break;
      case "activities":
        await revalidatePath("/activities");
        if (doc?.slug) {
          await revalidatePath(`/activities/${doc.slug}`);
        }
        await revalidateTag("activities");
        break;
      default:
        await revalidatePath("/");
        await revalidateTag(collection);
        break;
    }

    return NextResponse.json({
      message: "Revalidation successful",
      collection,
      operation,
      timestamp: new Date().toISOString(),
      revalidated: {
        paths: paths.length > 0 ? paths : ["Collection-specific paths"],
        tags: tags.length > 0 ? tags : [collection],
      },
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);

    return NextResponse.json(
      {
        message: "Revalidation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");
  const tag = searchParams.get("tag");
  const secret = searchParams.get("secret");

  // Debug logging - REMOVE THESE AFTER TESTING
  console.log("🔍 GET request debug:", {
    hasSecret: !!process.env.REVALIDATION_SECRET,
    secretLength: process.env.REVALIDATION_SECRET?.length || 0,
    secretPreview: process.env.REVALIDATION_SECRET?.substring(0, 10) + "...",
    providedSecret: secret?.substring(0, 10) + "...",
    providedSecretLength: secret?.length || 0,
    matches: secret === REVALIDATION_SECRET,
  });

  if (secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    if (path) {
      await revalidatePath(path);
      return NextResponse.json({
        message: `Revalidated path: ${path}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (tag) {
      await revalidateTag(tag);
      return NextResponse.json({
        message: `Revalidated tag: ${tag}`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { message: "Please provide either path or tag parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Manual revalidation error:", error);

    return NextResponse.json(
      {
        message: "Revalidation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
