"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import styles from "./ImageContainer.module.css";
import type { ImageContainerProps  } from "./ImageContainer.types";

export const ImageContainer = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
  decorative = false,
}: ImageContainerProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Validate src prop
  const isValidSrc =
    src && (typeof src === "string" ? src.trim() !== "" : true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const containerClasses = [
    styles.container,
    styles[aspectRatio],
    fullWidth && styles.fullWidth,
    imageLoading && styles.loading,
    imageError && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Fallback content when image fails or src is invalid
  const renderFallback = () => (
    <div
      className={styles.fallback}
      role="img"
      aria-label={alt || "Image unavailable"}
    >
      <div className={styles.fallbackContent}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className={styles.fallbackIcon}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <span className={styles.fallbackText}>
          {alt || "Image unavailable"}
        </span>
      </div>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingSpinner} />
    </div>
  );

  // Don't render anything if src is invalid
  if (!isValidSrc) {
    return renderFallback();
  }

  return (
    <div
      className={containerClasses}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
    >
      {imageError ? (
        renderFallback()
      ) : (
        <>
          <Image
            src={src}
            alt={alt || ""}
            fill
            className={styles[objectFit]}
            priority={priority}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {imageLoading && renderLoading()}
        </>
      )}
    </div>
  );
};
