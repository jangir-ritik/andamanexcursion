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
  const highlightRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Calculate underline positions
  const calculateUnderlineMetrics = () => {
    if (textRef.current && highlightRefs.current.size > 0) {
      const textRect = textRef.current.getBoundingClientRect();

      const positions: Array<{ left: number; top: number; width: number }> = [];

      highlightRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const highlightRect = ref.getBoundingClientRect();

        // Calculate position relative to the text container
        const left = highlightRect.left - textRect.left;
        const top = highlightRect.bottom - textRect.top;

        positions[index] = {
          left,
          top: top - 8,
          width: highlightRect.width,
        };
      });

      setUnderlinePositions(positions);
    }
  };

  // Calculate underline metrics when component mounts and on resize
  useEffect(() => {
    const timeoutId = setTimeout(calculateUnderlineMetrics, 100);
    return () => clearTimeout(timeoutId);
  }, [highlightedPhrases]);

  useEffect(() => {
    const handleResize = () => {
      calculateUnderlineMetrics();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Improved text processing that handles single and multiple highlights better
  const renderText = () => {
    if (!highlightedPhrases.length) {
      return text;
    }

    // Sort phrases by length (longest first) to handle overlapping cases
    const sortedPhrases = [...highlightedPhrases].sort(
      (a, b) => b.phrase.length - a.phrase.length
    );

    // Create a map to track which parts of text have been highlighted
    let textParts: Array<{
      text: string;
      isHighlight: boolean;
      index?: number;
    }> = [{ text, isHighlight: false }];

    // Process each phrase
    sortedPhrases.forEach((phraseObj, originalIndex) => {
      const newParts: typeof textParts = [];

      textParts.forEach((part) => {
        if (part.isHighlight) {
          // Don't modify already highlighted parts
          newParts.push(part);
          return;
        }

        const parts = part.text.split(phraseObj.phrase);
        if (parts.length === 1) {
          // Phrase not found in this part
          newParts.push(part);
          return;
        }

        // Add the parts with highlights
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            newParts.push({ text: parts[i], isHighlight: false });
          }

          // Add highlight between parts (except after the last part)
          if (i < parts.length - 1) {
            newParts.push({
              text: phraseObj.phrase,
              isHighlight: true,
              index: highlightedPhrases.findIndex(
                (p) => p.phrase === phraseObj.phrase
              ),
            });
          }
        }
      });

      textParts = newParts;
    });

    // Convert to React elements
    return textParts
      .map((part, index) => {
        if (part.isHighlight && part.index !== undefined) {
          return (
            <span
              key={`highlight-${part.index}-${index}`}
              ref={(el) => {
                if (el && part.index !== undefined) {
                  highlightRefs.current.set(part.index, el);
                }
              }}
              className={styles.highlight}
            >
              {part.text}
            </span>
          );
        }
        return part.text || null;
      })
      .filter(Boolean);
  };

  return (
    <Section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${styles.triviaSection} ${className}`}
      noPadding
    >
      <div className={styles.contentContainer}>
        {title && (
          <h2 id={`${id}-title`} className={styles.triviaTitle}>
            {title}
          </h2>
        )}
        <div className={styles.triviaContent}>
          <p ref={textRef} className={styles.triviaText}>
            {renderText()}
          </p>

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
                alt=""
                width={position.width}
                height={6}
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
      </div>
    </Section>
  );
};
