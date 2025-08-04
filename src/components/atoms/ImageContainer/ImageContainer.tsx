"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import styles from "./ImageContainer.module.css";
import type { ImageContainerProps } from "./ImageContainer.types";
import { useImageSrc, useImageMetadata } from "@/hooks/useImageSrc";
import { ImageOff } from "lucide-react";

export const ImageContainer = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
  decorative = false,
  preferredSize,
  width,
  height,
  fixedSize = false,
}: ImageContainerProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Use the hook to process the image source
  const {
    src: processedSrc,
    isValid,
    mediaMetadata,
  } = useImageSrc(src, {
    preferredSize,
    fallbackUrl: "", // Will use fallback UI instead
  });

  // Get metadata for potential use (dimensions, etc.)
  const metadata = useImageMetadata(src);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Determine if we should use fixed sizing
  const useFixedSize = fixedSize || (width && height);

  // Build container classes - exclude aspect ratio classes if using fixed size
  const containerClasses = [
    styles.container,
    !useFixedSize && styles[aspectRatio], // Only apply aspect ratio if not using fixed size
    fullWidth && !useFixedSize && styles.fullWidth, // fullWidth doesn't make sense with fixed size
    imageLoading && styles.loading,
    imageError && styles.error,
    useFixedSize && styles.fixedSize, // New class for fixed size styling
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Generate inline styles for fixed dimensions
  const containerStyle =
    useFixedSize && width && height
      ? {
          width: `${width}px`,
          height: `${height}px`,
          minHeight: `${height}px`, // Override the auto aspect ratio min-height
        }
      : undefined;

  // Show error fallback if image failed to load or source is invalid
  if (imageError || !isValid || !processedSrc) {
    return (
      <div
        className={containerClasses}
        style={containerStyle}
        role="img"
        aria-label={alt}
      >
        <div className={styles.errorFallback}>
          <div className={styles.errorIcon}>
            <ImageOff
              stroke={"var(--color-gray-400)"}
              size={useFixedSize ? Math.min(width || 32, height || 32, 32) : 32}
            />
          </div>
          <div className={styles.errorText}>Preview not available</div>
        </div>
      </div>
    );
  }

  // Fallback content when image fails or src is invalid
  const renderFallback = () => (
    <div
      className={styles.fallback}
      role="img"
      aria-label={alt || "Image unavailable"}
    >
      <div className={styles.fallbackContent}>
        <svg
          width={useFixedSize ? Math.min(width || 48, height || 48, 48) : 48}
          height={useFixedSize ? Math.min(width || 48, height || 48, 48) : 48}
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
  if (!isValid) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {renderFallback()}
      </div>
    );
  }

  // Generate sizes based on metadata or defaults
  const generateSizes = () => {
    if (useFixedSize && width) {
      return `${width}px`;
    }
    if (fullWidth) return "100vw";
    if (metadata?.width && metadata.width < 768) return `${metadata.width}px`;
    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  };

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
    >
      {imageError ? (
        renderFallback()
      ) : (
        <>
          <Image
            src={processedSrc}
            alt={alt || ""}
            fill={!useFixedSize} // Only use fill when not using fixed size
            width={useFixedSize ? width : undefined}
            height={useFixedSize ? height : undefined}
            className={styles[objectFit]}
            priority={priority}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes={generateSizes()}
            // Optional: Use metadata for better optimization
            {...(metadata?.width &&
              metadata?.height && {
                placeholder: "blur",
                blurDataURL: `data:image/svg+xml;base64,${toBase64(
                  shimmer(metadata.width, metadata.height)
                )}`,
              })}
          />
          {imageLoading && renderLoading()}
        </>
      )}
    </div>
  );
};

// Helper functions for blur placeholder (optional)
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);
