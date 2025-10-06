import { Metadata } from "next";
import { pageDataService } from "@/services/payload";
import BlogFilters from "@/components/blogs/BlogFilters";
import styles from "./page.module.css";

// You'll need to create these components or adjust based on your existing ones
// import BlogCard from "@/components/BlogCard";
// import FeaturedBlogCard from "@/components/FeaturedBlogCard";
// import Pagination from "@/components/Pagination";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    author?: string;
    sort?: "recent" | "popular" | "oldest";
  }>;
};

export default async function BlogsListingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const tag = resolvedParams.tag;
  const author = resolvedParams.author;
  const sortBy = resolvedParams.sort || "recent";

  // Get blog listing data
  const pageData = await pageDataService.getBlogListingPageData({
    page,
    limit: 12,
    tags: tag ? [tag] : undefined,
    author: author !== "all" ? author : undefined,
    sortBy,
  });

  const { blogs, featuredBlogs, pagination, filters } = pageData;

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Our Blog</h1>
          <p>
            Discover travel tips, destination guides, and stories from the
            Andaman Islands
          </p>
        </div>
      </section>

      {/* Featured Blogs - Show only on first page */}
      {page === 1 && featuredBlogs.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <h2>Featured Posts</h2>
            <div className={styles.featuredGrid}>
              {featuredBlogs.map((blog) => (
                <article key={blog.id} className={styles.featuredCard}>
                  <a href={blog.href}>
                    <img src={blog.image} alt={blog.title} />
                    <div className={styles.featuredContent}>
                      <div className={styles.meta}>
                        <span>{blog.author}</span>
                        <span>•</span>
                        <span>{blog.readingTime} min read</span>
                      </div>
                      <h3>{blog.title}</h3>
                      <p>{blog.description}</p>
                      <div className={styles.tags}>
                        {blog.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <BlogFilters 
            allTags={filters.tagOptions.slice(1)} // Remove "All Tags" option
            allAuthors={filters.authorOptions.slice(1)} // Remove "All Authors" option
          />
        </div>
      </section>

      {/* Blog Grid */}
      <section className={styles.blogGrid}>
        <div className={styles.container}>
          {blogs.length > 0 ? (
            <>
              <div className={styles.grid}>
                {blogs.map((blog) => (
                  <article key={blog.id} className={styles.blogCard}>
                    <a href={blog.href}>
                      <div className={styles.imageWrapper}>
                        <img src={blog.image} alt={blog.title} />
                      </div>
                      <div className={styles.content}>
                        <div className={styles.meta}>
                          <span>{blog.author}</span>
                          <span>•</span>
                          <time>
                            {new Date(blog.publishedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </time>
                          <span>•</span>
                          <span>{blog.readingTime} min read</span>
                        </div>
                        <h3>{blog.title}</h3>
                        <p>{blog.description}</p>
                        <div className={styles.tags}>
                          {blog.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </a>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  {pagination.hasPrevPage && (
                    <a
                      href={`/blogs?page=${pagination.currentPage - 1}${
                        tag ? `&tag=${tag}` : ""
                      }${author ? `&author=${author}` : ""}${
                        sortBy !== "recent" ? `&sort=${sortBy}` : ""
                      }`}
                      className={styles.paginationButton}
                    >
                      Previous
                    </a>
                  )}

                  <span className={styles.paginationInfo}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  {pagination.hasNextPage && (
                    <a
                      href={`/blogs?page=${pagination.currentPage + 1}${
                        tag ? `&tag=${tag}` : ""
                      }${author ? `&author=${author}` : ""}${
                        sortBy !== "recent" ? `&sort=${sortBy}` : ""
                      }`}
                      className={styles.paginationButton}
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>No blogs found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Travel Blog | Andaman Excursion",
  description:
    "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands. Discover hidden gems and plan your perfect trip.",
  openGraph: {
    title: "Travel Blog | Andaman Excursion",
    description:
      "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands.",
    url: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
    }/blogs`,
    siteName: "Andaman Excursion",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Blog | Andaman Excursion",
    description:
      "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands.",
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
    }/blogs`,
  },
};
