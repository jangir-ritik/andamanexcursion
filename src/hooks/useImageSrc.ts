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
        const mediaPath = `/api/media/file/${input}`;
        if (debug) console.log("Converting MongoDB ID to path:", mediaPath);
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
      // Try to get preferred size first
      let url = mediaObj.url;
      if (preferredSize && mediaObj.sizes?.[preferredSize]) {
        url = mediaObj.sizes[preferredSize];
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
  // Handle MongoDB ObjectID directly
  if (isMongoObjectId(url)) {
    return `/api/media/file/${url}`;
  }

  // Handle API paths that need to be converted to direct paths
  if (url.startsWith("/api/media/file/")) {
    return url; // Keep API media paths as they are
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
