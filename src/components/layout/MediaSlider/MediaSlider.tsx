"use client";
import React, { useState, memo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import styles from "./MediaSlider.module.css";
import { Button, ImageContainer } from "@/components/atoms";
import { Media } from "@payload-types";

interface MediaSliderProps {
  media: Array<{
    src: string | Media;
    alt: string;
    isVideo?: boolean;
  }>;
  altText?: string;
}

export const MediaSlider = memo<MediaSliderProps>(
  ({ media, altText = "Activity media" }) => {
    console.log(media, "media");
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? media.length - 1 : prevIndex - 1
        );
      },
      [media.length]
    );

    const handleNext = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) =>
          prevIndex === media.length - 1 ? 0 : prevIndex + 1
        );
      },
      [media.length]
    );

    const handleDotClick = useCallback((index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(index);
    }, []);

    // Helper to get media URL from Media object
    const getMediaUrl = (src: string | Media): string => {
      if (typeof src === "string") {
        return src;
      }

      if (src && typeof src === "object" && "url" in src) {
        return src.url || "";
      }

      return "";
    };

    // Helper to check if media is video - FIXED VERSION
    const isVideoMedia = (mediaItem: {
      src: string | Media;
      alt: string;
      isVideo?: boolean;
    }) => {
      // First check the explicit isVideo flag
      if (mediaItem.isVideo === true) return true;
      if (mediaItem.isVideo === false) return false;

      // Check Media object properties
      if (typeof mediaItem.src === "object" && mediaItem.src) {
        // if (mediaItem.src.mediaType === "video") return true;
        if (mediaItem.src.mimeType?.startsWith("video/")) return true;
      }

      // Check file extension
      const url = getMediaUrl(mediaItem.src);
      if (url && /\.(mp4|webm|ogg|avi|mov|wmv)$/i.test(url)) return true;

      return false;
    };

    // Render placeholder when no media is available
    if (!media || media.length === 0) {
      return (
        <div className={styles.imageSliderContainer}>
          <div className={styles.imageContainer}>
            <ImageContainer
              src=""
              alt="No media available"
              className={styles.ferryImage}
              aspectRatio="square"
              objectFit="cover"
              fullWidth={true}
            />
          </div>
        </div>
      );
    }

    const currentMedia = media[currentIndex];
    const currentMediaIsVideo = isVideoMedia(currentMedia);
    const currentMediaUrl = getMediaUrl(currentMedia.src);

    return (
      <div className={styles.imageSliderContainer}>
        {/* Main media display */}
        <div className={styles.imageContainer}>
          {currentMediaIsVideo ? (
            // Use native HTML video for videos
            <video
              key={currentMediaUrl} // Force re-render when URL changes
              className={styles.ferryImage}
              autoPlay
              muted
              loop
              playsInline
              controls // Add controls for better UX
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit", // Inherit border radius from parent
              }}
              aria-label={currentMedia.alt || `${altText} ${currentIndex + 1}`}
              onError={(e) => {
                console.error("Video failed to load:", currentMediaUrl, e);
              }}
              onLoadStart={() => {
                console.log("Video loading started:", currentMediaUrl);
              }}
              onCanPlay={() => {
                console.log("Video can play:", currentMediaUrl);
              }}
            >
              <source src={currentMediaUrl} type="video/mp4" />
              <source src={currentMediaUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Use ImageContainer for images
            <ImageContainer
              src={currentMedia.src}
              alt={currentMedia.alt || `${altText} ${currentIndex + 1}`}
              className={styles.ferryImage}
              aspectRatio="auto"
              objectFit="cover"
              fullWidth={true}
            />
          )}

          {/* Media type indicator */}
          <div className={styles.mediaTypeIndicator}>
            {currentMediaIsVideo ? (
              <Play size={20} aria-label="Video content" />
            ) : (
              <ImageIcon size={20} aria-label="Image content" />
            )}
          </div>
        </div>

        {/* Navigation arrows - only show if more than 1 item */}
        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="small"
              className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
              onClick={handlePrevious}
              aria-label="Previous media"
              type="button"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="small"
              className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
              onClick={handleNext}
              aria-label="Next media"
              type="button"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </>
        )}

        {/* Dot indicators - only show if more than 1 item */}
        {/* {media.length > 1 && (
          <div className={styles.sliderDots}>
            {media.map((mediaItem, index) => {
              const isVideo = isVideoMedia(mediaItem);

              return (
                <button
                  key={index}
                  className={`${styles.sliderDot} ${
                    index === currentIndex ? styles.sliderDotActive : ""
                  } ${isVideo ? styles.sliderDotVideo : styles.sliderDotImage}`}
                  onClick={(e) => handleDotClick(index, e)}
                  aria-label={`Go to ${isVideo ? "video" : "image"} ${
                    index + 1
                  }`}
                  type="button"
                >
                  <span className={styles.sliderDotInner}>
                    {isVideo ? <Play size={8} /> : <ImageIcon size={8} />}
                  </span>
                </button>
              );
            })}
          </div>
        )} */}

        {/* Current position indicator */}
        {media.length > 1 && (
          <div className={styles.sliderCounter}>
            <span aria-live="polite">
              {currentIndex + 1} / {media.length}
            </span>
          </div>
        )}
      </div>
    );
  }
);

MediaSlider.displayName = "MediaSlider";
