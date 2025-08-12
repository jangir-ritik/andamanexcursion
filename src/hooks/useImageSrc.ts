import { useMemo } from "react";
import { Media } from "@payload-types";

interface UseImageSrcOptions {
  fallbackUrl?: string;
  preferredSize?: keyof Media["sizes"]; // e.g., 'thumbnail', 'medium', 'large'
  baseUrl?: string;
  debug?: boolean;
}

interface UseImageSrcReturn {
  src: string;
  isValid: boolean;
  isMediaObject: boolean;
  originalSrc: string | Media | null | undefined;
  mediaMetadata?: Pick<Media, "width" | "height" | "mimeType" | "filesize">;
}

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
    baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "",
    debug = false,
  } = options;

  return useMemo(() => {
    if (debug) {
      console.log("useImageSrc input:", input);
    }

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
        // First try to check if we have a file with this ID as name in the static directory
        if (isMediaFile(input)) {
          return {
            src: `/media/${input}`,
            isValid: true,
            isMediaObject: false,
            originalSrc: input,
          };
        }
        // Fallback to converted path (API to direct media path)
        const mediaPath = `/media/${input}`;
        if (debug)
          console.log("Converting MongoDB ID to direct path:", mediaPath);
        return {
          src: mediaPath,
          isValid: true,
          isMediaObject: false,
          originalSrc: input,
        };
      }

      const processedSrc = processApiPath(input, baseUrl);
      if (debug) console.log("Processed string URL:", processedSrc);
      return {
        src: processedSrc,
        isValid: true,
        isMediaObject: false,
        originalSrc: input,
      };
    }

    // Process Media objects
    if (isMediaObject(input)) {
      const mediaObj = input as Media;
      let url = mediaObj.url;

      // Only use sized versions for images, not videos
      if (
        preferredSize &&
        mediaObj.sizes &&
        mediaObj.mimeType?.startsWith("image/")
      ) {
        const sizes = mediaObj.sizes as Record<string, any>;
        const sizedVersion = sizes[preferredSize];

        if (sizedVersion) {
          if (typeof sizedVersion === "string") {
            url = sizedVersion;
          } else if (sizedVersion && typeof sizedVersion === "object") {
            // Handle both { url: string } and direct string formats
            url = sizedVersion.url || sizedVersion.filename || url;
          }
        }
      }

      const processedSrc = processApiPath(url || "", baseUrl);
      if (debug) console.log("Processed media object URL:", processedSrc);

      return {
        src: processedSrc,
        isValid: true,
        isMediaObject: true,
        originalSrc: input,
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
  }, [input, fallbackUrl, preferredSize, baseUrl, debug]);
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

// Optional: Additional hook for image metadata
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
