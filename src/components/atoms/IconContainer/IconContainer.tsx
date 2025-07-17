"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import styles from "./IconContainer.module.css";
import { IconContainerProps } from "./IconContainer.types";

export const IconContainer = ({
  src,
  alt,
  size = 24,
  className = "",
  decorative = false,
  priority = false,
}: IconContainerProps) => {
  const [iconError, setIconError] = useState(false);
  const [iconLoading, setIconLoading] = useState(true);

  // Validate src prop
  const isValidSrc =
    src && (typeof src === "string" ? src.trim() !== "" : true);

  const handleIconError = useCallback(() => {
    setIconError(true);
    setIconLoading(false);
  }, []);

  const handleIconLoad = useCallback(() => {
    setIconLoading(false);
  }, []);

  const containerClasses = [
    styles.container,
    iconLoading && styles.loading,
    iconError && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Fallback content when icon fails or src is invalid
  const renderFallback = () => (
    <div
      className={styles.fallback}
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt || "Icon unavailable"}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={styles.fallbackIcon}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div
      className={styles.loadingOverlay}
      style={{ width: size, height: size }}
    >
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
      style={{ width: size, height: size }}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
    >
      {iconError ? (
        renderFallback()
      ) : (
        <>
          <Image
            src={typeof src === "string" ? src : src?.url || ""}
            alt={alt || ""}
            width={size}
            height={size}
            className={styles.icon}
            priority={priority}
            onError={handleIconError}
            onLoad={handleIconLoad}
          />
          {iconLoading && renderLoading()}
        </>
      )}
    </div>
  );
};
