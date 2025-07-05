"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./SectionTitle.module.css";
import type { SectionTitleProps } from "./SectionTitle.types";
import underlineGraphic from "@public/graphics/underline.svg";
import Image from "next/image";

export const SectionTitle = ({
  text,
  className,
  specialWord,
  id,
}: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();
  const [isHovered, setIsHovered] = useState(false);
  const [underlinePositions, setUnderlinePositions] = useState<
    Array<{ left: number; top: number; width: number }>
  >([]);
  const specialWordRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate underline position
  const calculateUnderlineMetrics = () => {
    if (titleRef.current && specialWordRef.current) {
      const titleRect = titleRef.current.getBoundingClientRect();
      const specialWordRect = specialWordRef.current.getBoundingClientRect();

      // Calculate position relative to the title container
      const left = specialWordRect.left - titleRect.left;
      const top = specialWordRect.bottom - titleRect.top;

      setUnderlinePositions([
        {
          left,
          top: top - 10,
          width: specialWordRect.width,
        },
      ]);
    }
  };

  // Calculate underline metrics when component mounts or content changes
  useEffect(() => {
    if (specialWord && titleRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      const timeoutId = setTimeout(calculateUnderlineMetrics, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [specialWord, text]);

  // Handle resize for responsive updates
  useEffect(() => {
    const handleResize = () => {
      calculateUnderlineMetrics();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to render text with special word highlighted
  const renderTextWithSpecialWord = () => {
    if (!specialWord || !text.includes(specialWord)) {
      return <span>{text}</span>;
    }

    // Instead of using regex, directly split the text by the special word
    const [before, after] = text.split(specialWord, 2);

    return (
      <>
        {before}
        <span
          ref={specialWordRef}
          className={styles.specialWord}
          data-hover={isHovered}
          style={{ whiteSpace: "nowrap" }} // Keep the special phrase together
        >
          {specialWord}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      className={titleClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 ref={titleRef} className={styles.title} id={id}>
        {renderTextWithSpecialWord()}
      </h2>
      {specialWord &&
        underlinePositions.map((position, index) => (
          <div
            key={index}
            className={styles.underline}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: `${position.width}px`,
            }}
          >
            <Image
              src={underlineGraphic}
              alt="underline"
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
