import { useMemo } from "react";
import { Media } from "@payload-types";

interface UseImageSrcOptions {
  fallbackUrl?: string;
  preferredSize?: string;
  // Smart size selection based on container width
  containerWidth?: number;
  // Device pixel ratio consideration
  highDPI?: boolean;
  debug?: boolean;
}

interface UseImageSrcReturn {
  src: string;
  isValid: boolean;
  isMediaObject: boolean;
  originalSrc: string | Media | null | undefined;
  selectedSize?: string;
  mediaMetadata?: Pick<Media, "width" | "height" | "mimeType" | "filesize">;
}

// Map of Payload size names to their actual dimensions
const SIZE_MAP = {
  thumbnail: { width: 150, maxWidth: 200 },
  small: { width: 400, maxWidth: 450 },
  medium: { width: 768, maxWidth: 900 },
  large: { width: 1200, maxWidth: Infinity },
} as const;

// Smart size selection based on container width
const selectOptimalSize = (
  containerWidth?: number,
  highDPI: boolean = false
): keyof typeof SIZE_MAP => {
  if (!containerWidth) return "medium";

  const targetWidth = highDPI ? containerWidth * 2 : containerWidth;

  if (targetWidth <= SIZE_MAP.thumbnail.maxWidth) return "thumbnail";
  if (targetWidth <= SIZE_MAP.small.maxWidth) return "small";
  if (targetWidth <= SIZE_MAP.medium.maxWidth) return "medium";
  return "large";
};

// Test for MongoDB ObjectID format
const isMongoObjectId = (str: string): boolean => {
  return /^[0-9a-f]{24}$/i.test(str);
};

// Check if URL is already a complete UploadThing URL
const isUploadThingUrl = (url: string): boolean => {
  return url.includes("uploadthing.com") || url.includes("utfs.io");
};

export const useImageSrc = (
  input: string | Media | null | undefined,
  options: UseImageSrcOptions = {}
): UseImageSrcReturn => {
  const {
    fallbackUrl = "",
    preferredSize,
    containerWidth,
    highDPI = false,
    debug = false,
  } = options;

  return useMemo(() => {
    // Type guard for Media objects
    const isMediaObject = (src: any): src is Media => {
      return src && typeof src === "object" && "url" in src;
    };

    // Check if input is valid
    const isValidInput =
      input && (typeof input === "string" ? input.trim() !== "" : true);

    if (!isValidInput) {
      return {
        src: fallbackUrl,
        isValid: false,
        isMediaObject: false,
        originalSrc: input,
      };
    }

    // Process string URLs
    if (typeof input === "string") {
      // If it's already an UploadThing URL, use it directly
      if (isUploadThingUrl(input)) {
        return {
          src: input,
          isValid: true,
          isMediaObject: false,
          originalSrc: input,
        };
      }

      // Handle MongoDB ObjectID - these will now be UploadThing URLs in the database
      if (isMongoObjectId(input)) {
        // For backward compatibility, if we still have ObjectIDs,
        // they should be resolved through Payload's media endpoint
        const mediaPath = `/api/media/file/${input}`;
        return {
          src: mediaPath,
          isValid: true,
          isMediaObject: false,
          originalSrc: input,
        };
      }

      // Handle other string URLs (relative paths, etc.)
      return {
        src: input,
        isValid: true,
        isMediaObject: false,
        originalSrc: input,
      };
    }

    // Process Media objects with smart size selection
    if (isMediaObject(input)) {
      const mediaObj = input as Media;
      let url = mediaObj.url;
      let selectedSize = "original";

      // Smart size selection for images only
      if (mediaObj.mimeType?.startsWith("image/") && mediaObj.sizes) {
        const sizes = mediaObj.sizes as Record<string, any>;

        // Use preferredSize if explicitly provided
        let targetSize = preferredSize;

        // Otherwise, auto-select based on container width
        if (!targetSize && containerWidth) {
          targetSize = selectOptimalSize(
            containerWidth,
            highDPI
          ) as keyof Media["sizes"];
        }

        // Fallback to medium if nothing specified
        if (!targetSize) {
          targetSize = "medium" as keyof Media["sizes"];
        }

        // Only proceed if targetSize is defined
        if (targetSize) {
          const sizedVersion = sizes[targetSize];

          if (sizedVersion) {
            selectedSize = targetSize as string;
            if (typeof sizedVersion === "string") {
              url = sizedVersion;
            } else if (sizedVersion && typeof sizedVersion === "object") {
              url = sizedVersion.url || sizedVersion.filename || url;
            }

            if (debug) {
              console.log(`Selected size: ${targetSize}`, sizedVersion);
            }
          } else {
            // Fallback to next available size
            const availableSizes = Object.keys(sizes);
            if (availableSizes.length > 0) {
              const fallbackSize = availableSizes[0];
              const fallbackVersion = sizes[fallbackSize];

              if (fallbackVersion) {
                selectedSize = fallbackSize;
                url =
                  typeof fallbackVersion === "string"
                    ? fallbackVersion
                    : fallbackVersion.url || fallbackVersion.filename || url;

                if (debug) {
                  console.log(
                    `Fallback to size: ${fallbackSize}`,
                    fallbackVersion
                  );
                }
              }
            }
          }
        }
      }

      // UploadThing URLs are already complete, no processing needed
      const finalUrl = url || fallbackUrl;

      if (debug) {
        console.log("Final processed URL:", finalUrl);
        console.log("Selected size:", selectedSize);
      }

      return {
        src: finalUrl,
        isValid: true,
        isMediaObject: true,
        originalSrc: input,
        selectedSize,
        mediaMetadata: {
          width: mediaObj.width,
          height: mediaObj.height,
          mimeType: mediaObj.mimeType,
          filesize: mediaObj.filesize,
        },
      };
    }

    // Fallback for unexpected types
    return {
      src: fallbackUrl,
      isValid: false,
      isMediaObject: false,
      originalSrc: input,
    };
  }, [input, fallbackUrl, preferredSize, containerWidth, highDPI, debug]);
};

// Hook to determine optimal image size based on viewport/container
export const useOptimalImageSize = (
  containerWidth?: number,
  viewport?: { width: number; height: number }
): keyof typeof SIZE_MAP => {
  return useMemo(() => {
    // Use container width if provided
    if (containerWidth) {
      return selectOptimalSize(containerWidth, window?.devicePixelRatio > 1);
    }

    // Use viewport width as fallback
    if (viewport?.width) {
      return selectOptimalSize(viewport.width, window?.devicePixelRatio > 1);
    }

    // Default fallback
    return "medium";
  }, [containerWidth, viewport]);
};

// Additional hook for image metadata
export const useImageMetadata = (src: string | Media | null | undefined) => {
  return useMemo(() => {
    if (!src || typeof src === "string") {
      return null;
    }

    if (src && typeof src === "object" && "width" in src) {
      return {
        width: src.width,
        height: src.height,
        aspectRatio: src.width && src.height ? src.width / src.height : null,
        mimeType: src.mimeType,
        filesize: src.filesize,
        alt: src.alt || "",
        filename: src.filename,
        availableSizes: src.sizes ? Object.keys(src.sizes) : [],
      };
    }

    return null;
  }, [src]);
};
