"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./SectionTitle.module.css";
import { SectionTitleProps } from "@/types/components/atoms/sectionTitle";
import underlineGraphic from "@public/graphics/underline.svg";
import Image from "next/image";

export const SectionTitle = ({
  text,
  className,
  specialWord,
}: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();
  const [isHovered, setIsHovered] = useState(false);
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [underlinePosition, setUnderlinePosition] = useState({
    left: 0,
    top: 0,
  });
  const specialWordRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Calculate underline width and position
  const calculateUnderlineMetrics = () => {
    if (specialWordRef.current && titleRef.current) {
      const specialWordRect = specialWordRef.current.getBoundingClientRect();
      const titleRect = titleRef.current.getBoundingClientRect();

      // Calculate position relative to the title container
      const left = specialWordRect.left - titleRect.left;
      const top = specialWordRect.bottom - titleRect.top - 9; // 9px below the special word

      setUnderlineWidth(specialWordRect.width);
      setUnderlinePosition({ left, top });
    }
  };

  // Calculate underline metrics when component mounts or content changes
  useEffect(() => {
    if (specialWordRef.current && titleRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      const timeoutId = setTimeout(calculateUnderlineMetrics, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [specialWord, text, isHovered]);

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
    if (!specialWord) {
      return <span>{text}</span>;
    }
    const escapedSpecialWord = specialWord.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(escapedSpecialWord, "gi");
    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < matches.length && (
              <span
                ref={index === 0 ? specialWordRef : null} // Only attach ref to first match
                className={styles.specialWord}
                data-hover={isHovered}
              >
                {matches[index]}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div
      className={titleClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 ref={titleRef} className={styles.title}>
        {renderTextWithSpecialWord()}
      </h2>
      {specialWord && underlineWidth > 0 && (
        <div
          className={styles.underline}
          style={{
            left: `${underlinePosition.left}px`,
            top: `${underlinePosition.top}px`,
            width: `${underlineWidth}px`,
          }}
        >
          <Image
            src={underlineGraphic}
            alt="underline"
            width={underlineWidth}
            height={9}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "fill",
            }}
          />
        </div>
      )}
    </div>
  );
};
