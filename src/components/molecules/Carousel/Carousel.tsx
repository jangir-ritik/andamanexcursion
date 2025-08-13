// Updated Carousel component with CTA support
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { CarouselProps } from "./Carousel.types";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import styles from "./Carousel.module.css";
import { ImageContainer, InlineLink } from "@/components/atoms";

export const Carousel = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Optimized mobile detection with debouncing
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
    };

    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(checkMobile, 100);
    };

    checkMobile();
    window.addEventListener("resize", debouncedResize, { passive: true });

    return () => {
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Optimized height calculation with better performance
  const calculateMaxHeight = useCallback(() => {
    if (!containerRef.current || slideRefs.current.length === 0) return;

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Reset heights for accurate measurement
      slideRefs.current.forEach((ref) => {
        if (ref) {
          ref.style.height = "auto";
          ref.style.minHeight = "auto";
        }
      });

      let maxHeight = 0;
      slideRefs.current.forEach((ref) => {
        if (ref) {
          const height = ref.getBoundingClientRect().height;
          maxHeight = Math.max(maxHeight, height);
        }
      });

      // Set minimum heights with padding
      const finalHeight = Math.max(maxHeight + 20, isMobile ? 500 : 392);
      setMaxHeight(finalHeight);
    });
  }, [isMobile]);

  // Recalculate height when slides or mobile state changes
  useEffect(() => {
    const timer = setTimeout(calculateMaxHeight, 150);
    return () => clearTimeout(timer);
  }, [slides, calculateMaxHeight]);

  // Navigation functions with improved performance
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      setTimeout(() => setIsTransitioning(false), 450);
    });
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

    requestAnimationFrame(() => {
      setTimeout(() => setIsTransitioning(false), 450);
    });
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return;

      setIsTransitioning(true);
      setCurrentSlide(index);

      requestAnimationFrame(() => {
        setTimeout(() => setIsTransitioning(false), 450);
      });
    },
    [isTransitioning, currentSlide]
  );

  // Improved autoplay with proper cleanup
  useEffect(() => {
    if (!autoPlay) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = undefined;
      }
    };

    startAutoPlay();

    return stopAutoPlay;
  }, [autoPlay, autoPlayInterval, nextSlide]);

  // Pause autoplay on hover for better UX
  const handleMouseEnter = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  }, [autoPlay, nextSlide, autoPlayInterval]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevSlide();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextSlide();
          break;
      }
    },
    [prevSlide, nextSlide]
  );

  // Fixed ref callback - no return value
  const setSlideRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      slideRefs.current[index] = el;
    };
  }, []);

  const containerStyle = maxHeight
    ? {
        minHeight: `${maxHeight}px`,
        height: isMobile ? "auto" : `${maxHeight}px`,
      }
    : {};

  const slideStyle = maxHeight
    ? {
        minHeight: `${maxHeight}px`,
        height: isMobile ? "auto" : `${maxHeight}px`,
      }
    : {};

  return (
    <div
      className={styles.carouselContainer}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className={styles.carouselWrapper}>
        <div
          className={styles.slidesContainer}
          style={containerStyle}
          role="tabpanel"
          aria-live="polite"
          aria-atomic="false"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              ref={setSlideRef(index)}
              className={`${styles.slide} ${
                index === currentSlide ? styles.activeSlide : ""
              }`}
              style={slideStyle}
              aria-hidden={index !== currentSlide}
              role="tabpanel"
              aria-label={`Slide ${index + 1} of ${slides.length}: ${
                slide.title
              }`}
            >
              <div className={styles.contentWrapper}>
                <div className={styles.textContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slidePrice}>{slide.price}</p>
                  <p className={styles.slideDescription}>{slide.description}</p>

                  <div className={styles.viewMoreWrapper}>
                    <InlineLink
                      href={slide.ctaLink || `/packages/${slide.id}`}
                      // tabIndex={index === currentSlide ? 0 : -1}
                    >
                      {slide.ctaLabel || "View More"}
                    </InlineLink>
                  </div>
                </div>
                <div className={styles.imageWrapper}>
                  <div className={styles.starIconTop} aria-hidden="true">
                    <Star
                      size={24}
                      fill="var(--color-secondary)"
                      stroke="none"
                    />
                  </div>
                  <ImageContainer
                    src={slide.image}
                    alt={slide.image?.alt || `${slide.title} package image`}
                    className={styles.slideImage}
                    priority={index === 0}
                  />
                  <div className={styles.starIconBottom} aria-hidden="true">
                    <Star size={24} fill="#EBF3FF" stroke="none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carouselControls} role="tablist">
        <div className={styles.indicators}>
          {slides.map((slide, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.activeIndicator : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-selected={index === currentSlide}
              role="tab"
              tabIndex={index === currentSlide ? 0 : -1}
            />
          ))}
        </div>
        <div className={styles.navigationButtons}>
          <button
            className={styles.navButton}
            onClick={prevSlide}
            aria-label="Go to previous slide"
            disabled={isTransitioning}
            type="button"
          >
            <ArrowLeft stroke="var(--color-primary)" size={24} />
          </button>
          <button
            className={styles.navButton}
            onClick={nextSlide}
            aria-label="Go to next slide"
            disabled={isTransitioning}
            type="button"
          >
            <ArrowRight stroke="var(--color-primary)" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
