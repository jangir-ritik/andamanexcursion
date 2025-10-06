"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

interface BlogFiltersProps {
  allTags: Array<{ id: string; label: string }>;
  allAuthors: Array<{ id: string; label: string }>;
}

export default function BlogFilters({ allTags, allAuthors }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filters change
    params.delete("page");
    
    router.push(`/blogs?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("query", searchQuery);
  };

  return (
    <div className="blog-filters">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* Sort */}
      <select
        name="sort"
        defaultValue={searchParams.get("sort") || "recent"}
        onChange={(e) => updateFilters("sort", e.target.value)}
        className="sort-select"
      >
        <option value="recent">Most Recent</option>
        <option value="popular">Most Popular</option>
        <option value="oldest">Oldest First</option>
      </select>

      {/* Tag Filter */}
      <select
        name="tag"
        defaultValue={searchParams.get("tag") || "all"}
        onChange={(e) => updateFilters("tag", e.target.value)}
        className="tag-select"
      >
        <option value="all">All Tags</option>
        {allTags.map((tagItem) => (
          <option key={tagItem.id} value={tagItem.id}>
            {tagItem.label}
          </option>
        ))}
      </select>

      {/* Author Filter */}
      <select
        name="author"
        defaultValue={searchParams.get("author") || "all"}
        onChange={(e) => updateFilters("author", e.target.value)}
        className="author-select"
      >
        <option value="all">All Authors</option>
        {allAuthors.map((authorItem) => (
          <option key={authorItem.id} value={authorItem.id}>
            {authorItem.label}
          </option>
        ))}
      </select>
    </div>
  );
}
