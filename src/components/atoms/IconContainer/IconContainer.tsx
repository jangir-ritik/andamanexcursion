"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./IconContainer.module.css";
import { IconContainerProps } from "./IconContainer.types";
import { ImageOff } from "lucide-react";

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

  useEffect(() => {
    setIconError(false);
    setIconLoading(true);
  }, [src]);

  // Validate src prop
  const isValidSrc =
    src && (typeof src === "string" ? src.trim() !== "" : true);

  console.log("IconContainer Debug:", {
    src,
    isValidSrc,
    iconError,
    iconLoading,
    willShowFallback: !isValidSrc || iconError,
  });

  const handleIconError = useCallback(() => {
    setIconError(true);
    setIconLoading(false);
  }, []);

  const handleIconLoad = useCallback(() => {
    setIconLoading(false);
    setIconError(false); // Ensure error is cleared on successful load
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
      <ImageOff
        color="var(--color-gray-500)"
        size={24}
        className={styles.fallbackIcon}
      />
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
