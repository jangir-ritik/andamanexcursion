"use client";

import { useState } from "react";
import {
  usePayloadList,
  usePayloadDoc,
  usePayloadCreate,
  usePayloadUpdate,
  usePayloadDelete,
} from "@/hooks/use-payload-query";
import type { Page } from "../../../payload-types";

export function PagesList() {
  // Example of fetching a list of pages
  const {
    data: pagesData,
    isLoading,
    error,
  } = usePayloadList("pages", {
    limit: 10,
    depth: 1,
    sort: "-createdAt", // Sort by most recent first
  });

  if (isLoading) return <div>Loading pages...</div>;
  if (error) return <div>Error loading pages: {(error as Error).message}</div>;

  return (
    <div>
      <h2>Pages</h2>
      <ul>
        {pagesData?.docs.map((page) => (
          <li key={page.id}>
            {page.title} - <small>{page.pageType}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageDetail({ id }: { id: string }) {
  // Example of fetching a single page
  const { data, isLoading } = usePayloadDoc("pages", id);

  if (isLoading) return <div>Loading page...</div>;

  return (
    <div>
      <h1>{data?.doc.title}</h1>
      <p>Page Type: {data?.doc.pageType}</p>
      {/* Render other page data */}
    </div>
  );
}

export function PageForm() {
  const [title, setTitle] = useState("");
  const [pageType, setPageType] = useState<Page["pageType"]>("activities");

  // Example of creating a page
  const createPage = usePayloadCreate("pages");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createPage.mutate({
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      pageType,
      // Other required fields based on your schema
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="pageType">Page Type</label>
        <select
          id="pageType"
          value={pageType}
          onChange={(e) => setPageType(e.target.value as Page["pageType"])}
        >
          <option value="home">Home</option>
          <option value="activities">Activities</option>
          <option value="fishing">Fishing</option>
          <option value="live-volcanos">Live Volcanos</option>
          <option value="specials">Specials</option>
          <option value="packages">Packages</option>
          <option value="how-to-reach">How to Reach</option>
        </select>
      </div>
      <button type="submit" disabled={createPage.isPending}>
        {createPage.isPending ? "Creating..." : "Create Page"}
      </button>
      {createPage.isError && (
        <p>Error: {(createPage.error as Error).message}</p>
      )}
    </form>
  );
}

export function PageUpdateForm({
  id,
  initialData,
}: {
  id: string;
  initialData: Page;
}) {
  const [title, setTitle] = useState(initialData.title);

  // Example of updating a page
  const updatePage = usePayloadUpdate("pages");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updatePage.mutate({
      id,
      data: {
        title,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <button type="submit" disabled={updatePage.isPending}>
        {updatePage.isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

export function PageDeleteButton({ id }: { id: string }) {
  // Example of deleting a page
  const deletePage = usePayloadDelete("pages");

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage.mutate(id);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deletePage.isPending}>
      {deletePage.isPending ? "Deleting..." : "Delete Page"}
    </button>
  );
}

// Example of working with media collection
export function MediaList() {
  const { data, isLoading } = usePayloadList("media", { limit: 10 });

  if (isLoading) return <div>Loading media...</div>;

  return (
    <div>
      <h2>Media</h2>
      <ul>
        {data?.docs.map((media) => (
          <li key={media.id}>
            {media.filename} -{" "}
            <img src={media.url || ""} alt={media.alt} width="100" />
          </li>
        ))}
      </ul>
    </div>
  );
}
