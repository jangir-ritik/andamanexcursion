import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface ImageContainerProps {
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
