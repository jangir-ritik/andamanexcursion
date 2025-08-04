import { Media } from "@payload-types";

export interface ImageContainerProps {
  src: string | Media | undefined | null;
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
  decorative?: boolean;
  preferredSize?: keyof Media["sizes"];
  // New props for fixed dimensions (ideal for icons)
  width?: number;
  height?: number;
  fixedSize?: boolean; // When true, uses width/height instead of aspect ratios
}
