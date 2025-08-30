"use client";
import React, { useState, useRef } from "react";
import styles from "./SectionTitle.module.css";
import type { SectionTitleProps } from "./SectionTitle.types";
import underlineGraphic from "@public/graphics/underline.svg";
import Image from "next/image";
import { useSingleElementUnderline } from "@/utils/underlinePositioning";

export const SectionTitle = ({
  text,
  className,
  specialWord,
  id,
  headingLevel = "h2", // Default to h2
}: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();
  const [isHovered, setIsHovered] = useState(false);

  const specialWordRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Use the utility hook for underline positioning
  const { positions: underlinePositions } = useSingleElementUnderline(
    titleRef,
    specialWordRef,
    [specialWord, text],
    10 // offset
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
            ref={index === 0 ? specialWordRef : null} // Only ref the first occurrence
            className={styles.specialWord}
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
        <h1 ref={titleRef} className={styles.title} id={id}>
          {renderTextWithSpecialWord()}
        </h1>
      ) : (
        <h2 ref={titleRef} className={styles.title} id={id}>
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
                height: "6px",
                objectFit: "cover",
                objectPosition: "center",
              }}
              aria-hidden="true"
            />
          </div>
        ))}
    </div>
  );
};
