import { useMemo } from "react";
import { Media } from "@payload-types";

interface UseImageSrcOptions {
  fallbackUrl?: string;
  preferredSize?: string; // Changed from keyof Media["sizes"] to string for flexibility
  // Smart size selection based on container width
  containerWidth?: number;
  // Device pixel ratio consideration
  highDPI?: boolean;
  baseUrl?: string;
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

// Check if file is a media file (image or video)
const isMediaFile = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg|avi|mov|wmv)$/i.test(url);
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
    baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "",
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
      // Handle MongoDB ObjectID directly
      if (isMongoObjectId(input)) {
        if (isMediaFile(input)) {
          return {
            src: `/media/${input}`,
            isValid: true,
            isMediaObject: false,
            originalSrc: input,
          };
        }
        const mediaPath = `/media/${input}`;
        // if (debug)
          // console.log("Converting MongoDB ID to direct path:", mediaPath);
        return {
          src: mediaPath,
          isValid: true,
          isMediaObject: false,
          originalSrc: input,
        };
      }

      const processedSrc = processApiPath(input, baseUrl);
      // if (debug) console.log("Processed string URL:", processedSrc);
      return {
        src: processedSrc,
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

            // if (debug) {
            //   console.log(`Selected size: ${targetSize}`, sizedVersion);
            // }
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

                // if (debug) {
                //   console.log(
                //     `Fallback to size: ${fallbackSize}`,
                //     fallbackVersion
                //   );
                // }
              }
            }
          }
        }
      }

      const processedSrc = processApiPath(url || "", baseUrl);
      // if (debug) {
      //   console.log("Final processed URL:", processedSrc);
      //   console.log("Selected size:", selectedSize);
      // }

      return {
        src: processedSrc,
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
  }, [
    input,
    fallbackUrl,
    preferredSize,
    containerWidth,
    highDPI,
    baseUrl,
    debug,
  ]);
};

// Helper function to process API paths
const processApiPath = (url: string, baseUrl: string): string => {
  // Handle media files - serve from static directory if they look like media files
  if (typeof url === "string" && isMediaFile(url)) {
    if (url.startsWith("/")) {
      return url; // Already a path
    } else {
      return `/media/${url}`; // Add path prefix
    }
  }

  // Handle MongoDB ObjectID directly - convert to direct media path
  if (isMongoObjectId(url)) {
    return `/media/${url}`;
  }

  // Convert API paths to direct media paths
  if (url.startsWith("/api/media/file/")) {
    const filename = url.replace("/api/media/file/", "");
    return `/media/${filename}`;
  }

  // Handle relative URLs
  if (url.startsWith("/") && baseUrl) {
    return `${baseUrl}${url}`;
  }

  return url;
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
