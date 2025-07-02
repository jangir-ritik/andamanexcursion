"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { CarouselProps } from "./Carousel.types";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import styles from "./Carousel.module.css";
import { InlineLink } from "@/components/atoms/InlineLink/InlineLink";

export const Carousel = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, slides.length]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, nextSlide]);

  return (
    <div className={styles.carouselContainer} ref={containerRef}>
      <div className={styles.carouselWrapper}>
        <div className={styles.slidesContainer}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${
                index === currentSlide ? styles.activeSlide : ""
              }`}
              aria-hidden={index !== currentSlide}
            >
              <div className={styles.contentWrapper}>
                <div className={styles.textContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slidePrice}>{slide.price}</p>
                  <p className={styles.slideDescription}>{slide.description}</p>

                  <div className={styles.viewMoreWrapper}>
                    <InlineLink href={`/packages/${slide.id}`}>
                      View More
                    </InlineLink>
                  </div>
                </div>
                <div className={styles.imageWrapper}>
                  <div className={styles.starIconTop}>
                    <Star
                      size={24}
                      fill="var(--color-secondary)"
                      stroke="none"
                    />
                  </div>
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className={styles.slideImage}
                    loading="lazy"
                  />
                  <div className={styles.starIconBottom}>
                    <Star size={24} fill="#EBF3FF" stroke="none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carouselControls}>
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.activeIndicator : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className={styles.navigationButtons}>
          <button
            className={styles.navButton}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ArrowLeft stroke="var(--color-primary)" size={24} />
          </button>
          <button
            className={styles.navButton}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ArrowRight stroke="var(--color-primary)" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
