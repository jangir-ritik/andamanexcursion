import { useMemo } from "react";
import { Media } from "@payload-types";

interface UseImageSrcOptions {
  fallbackUrl?: string;
  preferredSize?: string;
  containerWidth?: number;
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

// Check if URL is already a complete external URL (non-Payload)
const isExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// Construct UploadThing URL using key - Updated for better compatibility
const constructUploadThingUrl = (key: string): string => {
  // Your UploadThing App ID
  const UPLOADTHING_APP_ID =
    process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || "zu0uz82q68";
  return `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${key}`;
};

// Enhanced URL extraction for UploadThing
const extractUploadThingKey = (url: string): string | null => {
  try {
    // Match UploadThing URL patterns
    const utMatch = url.match(/\/f\/([^/?]+)/);
    if (utMatch) return utMatch[1];

    // Match other patterns that might contain the key
    const keyMatch = url.match(/key=([^&]+)/);
    if (keyMatch) return keyMatch[1];

    return null;
  } catch {
    return null;
  }
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
      return (
        src &&
        typeof src === "object" &&
        ("url" in src || "filename" in src || "_key" in src)
      );
    };

    // Check if input is valid
    const isValidInput =
      input && (typeof input === "string" ? input.trim() !== "" : true);

    if (!isValidInput) {
      if (debug) {
        console.log("Invalid input:", input);
      }
      return {
        src: fallbackUrl,
        isValid: false,
        isMediaObject: false,
        originalSrc: input,
      };
    }

    // Process string URLs
    if (typeof input === "string") {
      // If it's already a complete external URL, use it directly
      if (isExternalUrl(input)) {
        if (debug) {
          console.log("Using external URL directly:", input);
        }
        return {
          src: input,
          isValid: true,
          isMediaObject: false,
          originalSrc: input,
        };
      }

      // Handle relative paths - ensure they start with /
      const finalUrl = input.startsWith("/") ? input : `/${input}`;

      if (debug) {
        console.log("Processing relative URL:", finalUrl);
      }

      return {
        src: finalUrl,
        isValid: true,
        isMediaObject: false,
        originalSrc: input,
      };
    }

    // Process Media objects with smart size selection
    if (isMediaObject(input)) {
      const mediaObj = input as Media;
      let selectedSize = "original";
      let processedUrl: string;

      if (debug) {
        console.log("Processing Media object:", {
          filename: mediaObj.filename,
          mimeType: mediaObj.mimeType,
          url: mediaObj.url,
          sizes: mediaObj.sizes ? Object.keys(mediaObj.sizes) : [],
          hasDirectUrl: mediaObj.url && isExternalUrl(mediaObj.url),
        });
      }

      // For images, try to get the appropriate sized version
      if (mediaObj.mimeType?.startsWith("image/") && mediaObj.sizes) {
        const sizes = mediaObj.sizes as Record<string, any>;

        // Determine preferred size
        let preferredSizeName = preferredSize;
        if (!preferredSizeName && containerWidth) {
          preferredSizeName = selectOptimalSize(
            containerWidth,
            highDPI
          ) as keyof Media["sizes"];
        }
        if (!preferredSizeName) {
          preferredSizeName = "medium" as keyof Media["sizes"];
        }

        // Try to get the sized version
        if (preferredSizeName && sizes[preferredSizeName]) {
          const sizedVersion = sizes[preferredSizeName];

          if (debug) {
            console.log(
              `Found sized version for ${preferredSizeName}:`,
              sizedVersion
            );
          }

          selectedSize = preferredSizeName as string;

          // Check if sized version has a direct URL
          if (
            typeof sizedVersion === "object" &&
            sizedVersion.url &&
            isExternalUrl(sizedVersion.url)
          ) {
            processedUrl = sizedVersion.url;
            if (debug) {
              console.log("Using direct URL from sized version:", processedUrl);
            }
          } else if (
            typeof sizedVersion === "string" &&
            isExternalUrl(sizedVersion)
          ) {
            processedUrl = sizedVersion;
            if (debug) {
              console.log("Using sized version string URL:", processedUrl);
            }
          } else if (sizedVersion._key || sizedVersion.key) {
            // Construct URL from key
            const key = sizedVersion._key || sizedVersion.key;
            processedUrl = constructUploadThingUrl(key);
            if (debug) {
              console.log(
                "Constructed URL from sized version key:",
                processedUrl
              );
            }
          } else {
            // Fallback to main image logic
            processedUrl = getMainImageUrl(mediaObj, debug);
          }
        } else {
          // No preferred size available, use main image
          processedUrl = getMainImageUrl(mediaObj, debug);
        }
      } else {
        // For non-images or when sizes are not available
        processedUrl = getMainImageUrl(mediaObj, debug);
      }

      if (debug) {
        console.log("Final processed Media URL:", {
          originalFilename: mediaObj.filename,
          selectedSize,
          finalUrl: processedUrl,
        });
      }

      return {
        src: processedUrl,
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
    if (debug) {
      console.log("Unexpected input type:", typeof input, input);
    }

    return {
      src: fallbackUrl,
      isValid: false,
      isMediaObject: false,
      originalSrc: input,
    };
  }, [input, fallbackUrl, preferredSize, containerWidth, highDPI, debug]);
};

// Helper function to get main image URL
function getMainImageUrl(mediaObj: Media, debug: boolean): string {
  // Priority 1: Direct URL from media object (when disablePayloadAccessControl is true)
  if (
    mediaObj.url &&
    isExternalUrl(mediaObj.url) &&
    !mediaObj.url.includes("undefined")
  ) {
    if (debug) {
      console.log("Using direct URL from media object:", mediaObj.url);
    }
    return mediaObj.url;
  }

  // Priority 2: Construct from _key if available
  const mainKey = (mediaObj as any)._key || (mediaObj as any).key;
  if (mainKey) {
    const constructedUrl = constructUploadThingUrl(mainKey);
    if (debug) {
      console.log("Constructed URL from main key:", constructedUrl);
    }
    return constructedUrl;
  }

  // Priority 3: Extract key from existing URL if it's an UploadThing URL
  if (mediaObj.url) {
    const extractedKey = extractUploadThingKey(mediaObj.url);
    if (extractedKey) {
      const constructedUrl = constructUploadThingUrl(extractedKey);
      if (debug) {
        console.log("Reconstructed URL from extracted key:", constructedUrl);
      }
      return constructedUrl;
    }
  }

  // Priority 4: Fallback to Payload API route
  if (mediaObj.filename) {
    const fallbackUrl = `/api/media/file/${mediaObj.filename}`;
    if (debug) {
      console.log("Fallback to Payload API URL:", fallbackUrl);
    }
    return fallbackUrl;
  }

  // Last resort
  if (debug) {
    console.log("No valid URL found, using empty string");
  }
  return "";
}

// Export other hooks unchanged
export const useOptimalImageSize = (
  containerWidth?: number,
  viewport?: { width: number; height: number }
): keyof typeof SIZE_MAP => {
  return useMemo(() => {
    if (containerWidth) {
      return selectOptimalSize(
        containerWidth,
        typeof window !== "undefined" ? window?.devicePixelRatio > 1 : false
      );
    }

    if (viewport?.width) {
      return selectOptimalSize(
        viewport.width,
        typeof window !== "undefined" ? window?.devicePixelRatio > 1 : false
      );
    }

    return "medium";
  }, [containerWidth, viewport]);
};

export const useImageMetadata = (src: string | Media | null | undefined) => {
  return useMemo(() => {
    if (!src || typeof src === "string") {
      return null;
    }

    if (
      src &&
      typeof src === "object" &&
      ("width" in src || "filename" in src)
    ) {
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
