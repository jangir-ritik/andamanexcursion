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

  // Check if the source is an SVG
  const isSvg = typeof src === "string" && src.toLowerCase().includes(".svg");

  console.log("IconContainer Debug:", {
    src,
    isValidSrc,
    isSvg,
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
    isSvg && styles.svg, // Add SVG-specific styling class
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
        size={Math.min(24, size * 0.8)}
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
            // SVG-specific optimizations
            {...(isSvg && {
              unoptimized: false, // Next.js can optimize SVGs
              quality: 100, // Preserve SVG quality
            })}
          />
          {iconLoading && renderLoading()}
        </>
      )}
    </div>
  );
};
