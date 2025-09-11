// Updated SectionTitle component with responsive offset and mobile SVG fixes
"use client";
import React, { useState, useRef } from "react";
import styles from "./SectionTitle.module.css";
import type { SectionTitleProps } from "./SectionTitle.types";
import underlineGraphic from "@public/graphics/underline.svg";
import Image from "next/image";
import { useSingleElementUnderline } from "@/utils/underlinePositioning";
import clsx from "clsx";

export const SectionTitle = ({
  text,
  className,
  specialWord,
  id,
  headingLevel = "h2",
  titleTextClasses,
  specialWordStyles,
}: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();
  const [isHovered, setIsHovered] = useState(false);
  const specialWordRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Calculate responsive offset based on viewport
  const getResponsiveOffset = () => {
    if (typeof window === "undefined") return 10; // SSR fallback

    const vw = window.innerWidth;

    // Updated responsive offset values to match mobile needs
    if (vw <= 360) return 1; // Very small screens - minimal offset
    if (vw <= 480) return 2; // Small mobile
    if (vw <= 768) return 4; // Mobile
    if (vw <= 1024) return 8; // Tablet
    return 10; // Desktop
  };

  // Use the utility hook for underline positioning with responsive offset
  const { positions: underlinePositions } = useSingleElementUnderline(
    titleRef,
    specialWordRef,
    [specialWord, text],
    getResponsiveOffset()
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Function to render text with special word highlighted
  const renderTextWithSpecialWord = () => {
    if (!specialWord || !text.includes(specialWord)) {
      return <span>{text}</span>;
    }

    // Handle multiple occurrences of the special word
    const parts = text.split(specialWord);
    const result: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      // Add the text part
      if (part) {
        result.push(<span key={`text-${index}`}>{part}</span>);
      }

      // Add the special word (except after the last part)
      if (index < parts.length - 1) {
        result.push(
          <span
            key={`special-${index}`}
            ref={index === 0 ? specialWordRef : null}
            className={clsx(styles.specialWord, specialWordStyles)}
            data-hover={isHovered}
          >
            {specialWord}
          </span>
        );
      }
    });

    return result;
  };

  return (
    <div
      className={titleClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {headingLevel === "h1" ? (
        <h1
          ref={titleRef}
          className={clsx(styles.title, titleTextClasses)}
          id={id}
        >
          {renderTextWithSpecialWord()}
        </h1>
      ) : (
        <h2
          ref={titleRef}
          className={clsx(styles.title, titleTextClasses)}
          id={id}
        >
          {renderTextWithSpecialWord()}
        </h2>
      )}

      {specialWord &&
        underlinePositions.map((position, index) => (
          <div
            key={`underline-${index}`}
            className={styles.underline}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
            }}
          >
            <Image
              src={underlineGraphic}
              alt=""
              width={position.width}
              height={5}
              style={{
                width: "100%",
                height: "clamp(0.1875rem, 1.5vw, 0.375rem)", // Responsive height: smaller on mobile
                objectFit: "contain", // Changed from "cover" to prevent clipping
                objectPosition: "center",
              }}
              aria-hidden="true"
            />
          </div>
        ))}
    </div>
  );
};
