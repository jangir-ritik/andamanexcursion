import React from "react";
import Image from "next/image";
import styles from "./ImageContainer.module.css";
import { ImageContainerProps } from "@/types/components/atoms/imageContainer";

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
  const containerClasses = [
    styles.container,
    styles[aspectRatio],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div
      className={containerClasses}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={styles[objectFit]}
        priority={priority}
      />
    </div>
  );
};
