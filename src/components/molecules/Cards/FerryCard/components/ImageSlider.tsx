import React, { useState, memo, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../FerryCard.module.css";
import { Button } from "@/components/atoms";
import { ferryCardContent } from "../FerryCard.content";

interface ImageSliderProps {
  images: string[];
  altText: string;
}

export const ImageSlider = memo<ImageSliderProps>(({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    },
    [images.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    },
    [images.length]
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={styles.imageSliderContainer}>
      <div className={styles.imageContainer}>
        <Image
          src={images[currentIndex]}
          alt={altText}
          fill
          className={styles.ferryImage}
          sizes="(max-width: 768px) 100vw, 38%"
          priority
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="small"
            className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
            onClick={handlePrevious}
            aria-label={ferryCardContent.aria.previousImage}
            type="button"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Button>

          <Button
            variant="secondary"
            size="small"
            className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
            onClick={handleNext}
            aria-label={ferryCardContent.aria.nextImage}
            type="button"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
});

ImageSlider.displayName = "ImageSlider";
