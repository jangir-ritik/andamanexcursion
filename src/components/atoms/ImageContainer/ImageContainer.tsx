import React from "react";
import Image from "next/image";
import styles from "./ImageContainer.module.css";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface ImageContainerProps {
  src: string | StaticImport;
  alt: string;
  className?: string;
  aspectRatio?:
    | "auto"
    | "square"
    | "video"
    | "portrait"
    | "landscape"
    | "banner";
  objectFit?: "cover" | "contain" | "fill";
  priority?: boolean;
  fullWidth?: boolean;
}

export const ImageContainer = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
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
    <div className={containerClasses}>
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
