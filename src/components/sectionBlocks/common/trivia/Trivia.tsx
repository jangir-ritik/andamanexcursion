"use client";
import { Column, Section } from "@/components/layout";
import React, { useRef, useEffect, useState } from "react";
import styles from "./Trivia.module.css";
import Image from "next/image";
import underlineGraphic from "@public/graphics/underline.svg";

export interface HighlightedPhrase {
  phrase: string;
  id: string;
}

export interface TriviaContent {
  title?: string;
  text: string;
  highlightedPhrases: HighlightedPhrase[];
}

export interface TriviaProps {
  content: TriviaContent;
  className?: string;
  id?: string;
}

export const Trivia = ({
  content,
  className = "",
  id = "trivia",
}: TriviaProps) => {
  const { title, text, highlightedPhrases } = content;

  const [underlinePositions, setUnderlinePositions] = useState<
    Array<{
      left: number;
      top: number;
      width: number;
    }>
  >([]);

  const textRef = useRef<HTMLParagraphElement>(null);
  const highlightRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Initialize refs array based on highlightedPhrases length
  useEffect(() => {
    highlightRefs.current = highlightRefs.current.slice(
      0,
      highlightedPhrases.length
    );
  }, [highlightedPhrases]);

  // Calculate underline positions
  const calculateUnderlineMetrics = () => {
    if (textRef.current && highlightRefs.current.length) {
      const textRect = textRef.current.getBoundingClientRect();

      const positions = highlightRefs.current
        .map((ref) => {
          if (!ref) return null;

          const highlightRect = ref.getBoundingClientRect();

          // Calculate position relative to the text container
          const left = highlightRect.left - textRect.left;
          const top = highlightRect.bottom - textRect.top;

          return {
            left,
            top: top - 8,
            width: highlightRect.width,
          };
        })
        .filter(Boolean) as Array<{ left: number; top: number; width: number }>;

      setUnderlinePositions(positions);
    }
  };

  // Calculate underline metrics when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(calculateUnderlineMetrics, 0);
    return () => clearTimeout(timeoutId);
  }, [highlightedPhrases]);

  // Handle resize for responsive updates
  useEffect(() => {
    const handleResize = () => {
      calculateUnderlineMetrics();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Process text to include highlighted phrases
  const renderText = () => {
    let processedText = text;

    // Create a temporary div to hold our text content
    return (
      <p ref={textRef} className={styles.triviaText}>
        {highlightedPhrases.length === 0
          ? text
          : highlightedPhrases.reduce(
              (acc: React.ReactNode[], phraseObj, index) => {
                const phrase = phraseObj.phrase;
                const parts = processedText.split(phrase);
                if (parts.length === 1) return acc;

                processedText = parts.slice(1).join(phrase);

                return [
                  ...acc,
                  parts[0],
                  <span
                    key={`highlight-${index}`}
                    ref={(el) => {
                      if (el) {
                        highlightRefs.current[index] = el;
                      }
                    }}
                    className={styles.highlight}
                  >
                    {phrase}
                  </span>,
                ];
              },
              []
            )}
      </p>
    );
  };

  return (
    <Section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${styles.triviaSection} ${className}`}
    >
      <Column
        fullWidth
        gap="var(--space-6)"
        className={styles.contentContainer}
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <h2 id={`${id}-title`} className={styles.triviaTitle}>
          {title}
        </h2>
        <div className={styles.triviaContent}>
          {renderText()}

          {underlinePositions.map((position, index) => (
            <div
              key={`underline-${index}`}
              className={styles.underlineWrapper}
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
      </Column>
    </Section>
  );
};
