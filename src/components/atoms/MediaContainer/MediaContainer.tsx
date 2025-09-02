"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./MediaContainer.module.css";
import { Media } from "@payload-types";
import { useImageSrc } from "@/hooks/useImageSrc";
import { cn } from "@/utils/cn";
import { ImageOff } from "lucide-react";
import clsx from "clsx";

export interface MediaContainerProps {
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
  // Remove preferredSize - let the component decide intelligently
  width?: number;
  height?: number;
  fixedSize?: boolean;
  // Video specific props
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string | Media;
  playsInline?: boolean;
}

const MediaContainer: React.FC<MediaContainerProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
  decorative = false,
  width,
  height,
  fixedSize = false,
  // Video props
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  poster,
  playsInline = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image load failed:", {
      processedSrc,
      originalSrc: src,
      alt,
      selectedSize,
    });
    setImageError(true);
  };

  // Smart size selection based on component props
  const getPreferredSize = (): string => {
    // If fixed size is specified, choose based on width
    if (fixedSize && width) {
      if (width <= 400) return "small";
      if (width <= 768) return "medium";
      return "large";
    }

    // Choose based on aspect ratio and fullWidth
    if (fullWidth) {
      if (aspectRatio === "banner") return "large";
      return "medium";
    }

    // Default size selection
    switch (aspectRatio) {
      case "square":
      case "portrait":
        return "small";
      case "landscape":
      case "banner":
        return "medium";
      default:
        return "medium";
    }
  };

  // Use the hook with smart size selection
  const {
    src: processedSrc,
    isValid,
    isMediaObject,
    selectedSize,
    mediaMetadata,
  } = useImageSrc(src, {
    preferredSize: getPreferredSize(),
    containerWidth: width,
    highDPI:
      typeof window !== "undefined" ? window.devicePixelRatio > 1 : false,
    debug: process.env.NODE_ENV === "development",
  });

  // Determine if this is a video
  useEffect(() => {
    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      setIsVideo(media.mimeType?.startsWith("video/") ?? false);
    } else if (typeof processedSrc === "string") {
      const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv)$/i;
      setIsVideo(videoExtensions.test(processedSrc));
    }
  }, [processedSrc, isMediaObject, src]);

  // Handle video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video && isVideo && autoplay) {
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.warn("Video autoplay failed:", error);
        }
      };
      playVideo();
    }
  }, [isVideo, autoplay]);

  useEffect(() => {
    setImageError(false);
  }, [src, processedSrc]);

  // Generate CSS classes
  const containerClasses = cn(
    styles.mediaContainer,
    {
      [styles.fullWidth]: fullWidth,
      [styles.fixedSize]: fixedSize,
      [styles[`aspect-${aspectRatio}`]]: aspectRatio !== "auto" && !fixedSize,
      [styles[`fit-${objectFit}`]]: true,
    },
    className
  );

  // Handle video error fallback
  const handleVideoError = () => {
    setIsVideoError(true);
  };

  // Get poster image with the same optimization logic
  const getPosterSrc = (): string | undefined => {
    // If poster prop is provided, process it
    if (poster) {
      if (typeof poster === "string") {
        return poster;
      }
      // If it's a Media object, get the optimized URL
      if (typeof poster === "object" && poster.url) {
        return poster.sizes?.small?.url || poster.url;
      }
    }

    // Fallback to video's poster from videoSettings
    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      if (media.videoSettings?.poster) {
        const posterMedia = media.videoSettings.poster as Media;
        return posterMedia.sizes?.small?.url || posterMedia.url || "";
      }
    }

    return undefined;
  };

  // // Debug logging in development
  // if (process.env.NODE_ENV === "development" && selectedSize) {
  //   console.log(`MediaContainer: Using ${selectedSize} size for`, alt);
  // }

  // If not valid or error occurred with video, show placeholder
  if (!isValid || (isVideo && isVideoError) || imageError) {
    return (
      <div
        className={containerClasses}
        style={fixedSize ? { width, height } : undefined}
      >
        <div className={styles.placeholder}>
          <ImageOff size={24} className={styles.placeholderIcon} />
          <span className={styles.placeholderText}>
            {alt || "Media not available"}
          </span>
        </div>
      </div>
    );
  }

  // Render video
  if (isVideo && !isVideoError) {
    const videoSettings =
      isMediaObject && src && typeof src === "object"
        ? (src as Media).videoSettings
        : undefined;

    return (
      <div
        className={containerClasses}
        style={fixedSize ? { width, height } : undefined}
      >
        <video
          ref={videoRef}
          className={clsx(styles.media, styles.video)}
          autoPlay={autoplay && (videoSettings?.autoplay ?? true)}
          muted={muted && (videoSettings?.muted ?? true)}
          loop={loop && (videoSettings?.loop ?? true)}
          controls={controls || (videoSettings?.controls ?? false)}
          playsInline={playsInline}
          poster={getPosterSrc()}
          preload="metadata"
          onError={handleVideoError}
          aria-label={decorative ? undefined : alt}
          role={decorative ? "presentation" : undefined}
        >
          <source
            src={processedSrc}
            type={mediaMetadata?.mimeType || "video/mp4"}
          />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Render image using pre-optimized Payload sizes
  return (
    <div
      className={containerClasses}
      style={fixedSize ? { width, height } : undefined}
    >
      {fixedSize && width && height ? (
        <Image
          src={processedSrc}
          alt={decorative ? "" : alt}
          width={width}
          height={height}
          priority={priority}
          className={styles.media}
          onError={handleImageError}
          aria-hidden={decorative}
        />
      ) : (
        <Image
          src={processedSrc}
          alt={decorative ? "" : alt}
          fill
          priority={priority}
          className={styles.media}
          sizes={fullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          onError={handleImageError}
          aria-hidden={decorative}
        />
      )}
    </div>
  );
};

export default MediaContainer;
