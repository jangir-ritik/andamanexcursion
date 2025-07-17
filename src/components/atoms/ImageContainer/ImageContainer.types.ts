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
  preferredSize?: keyof Media["sizes"]; // New prop for image size selection
}
