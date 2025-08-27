// src/components/atoms/MediaContainer/MediaContainer.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./MediaContainer.module.css";
import { Media } from "@payload-types";
import { useImageSrc } from "@/hooks/useImageSrc";
import { cn } from "@/utils/cn";

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
  preferredSize?: keyof Media["sizes"];
  // New props for fixed dimensions (ideal for icons)
  width?: number;
  height?: number;
  fixedSize?: boolean; // When true, uses width/height instead of aspect ratios
  // Video specific props
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
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
  preferredSize,
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

  // Use the existing hook to process src
  const {
    src: processedSrc,
    isValid,
    isMediaObject,
    mediaMetadata,
  } = useImageSrc(src, {
    preferredSize,
    debug: false,
  });

  // Determine if this is a video
  useEffect(() => {
    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      setIsVideo(media.mimeType?.startsWith("video/") ?? false);
    } else if (typeof processedSrc === "string") {
      // Check file extension for video formats
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

  // Get poster image if available from Media object
  const getPosterSrc = () => {
    if (poster) return poster;

    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      if (media.videoSettings?.poster) {
        const posterMedia = media.videoSettings.poster as Media;
        return posterMedia.url || "";
      }
    }
    return undefined;
  };

  // If not valid or error occurred with video, show placeholder or fallback
  if (!isValid || (isVideo && isVideoError)) {
    return (
      <div
        className={containerClasses}
        style={fixedSize ? { width, height } : undefined}
      >
        <div className={styles.placeholder}>
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
          className={styles.media}
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

  // Render image (default case)
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
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
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
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          aria-hidden={decorative}
        />
      )}
    </div>
  );
};

export default MediaContainer;
