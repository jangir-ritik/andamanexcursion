"use client";
import { Section } from "@/components/layout";
import React, { useRef } from "react";
import styles from "./Trivia.module.css";
import Image from "next/image";
import underlineGraphic from "@public/graphics/underline.svg";
import { useTextHighlightUnderlines } from "@/utils/underlinePositioning";

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

  const textRef = useRef<HTMLParagraphElement>(null);
  const highlightRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Calculate responsive offset based on viewport for text highlighting
  const getResponsiveOffset = () => {
    if (typeof window === "undefined") return 8; // SSR fallback

    const vw = window.innerWidth;

    // Responsive offset values for text highlighting
    if (vw <= 360) return 2; // Very small screens
    if (vw <= 480) return 1; // Small mobile
    if (vw <= 768) return 4; // Mobile
    if (vw <= 1024) return 7; // Tablet
    return 8; // Desktop
  };

  // Use the custom hook for underline positioning with responsive offset
  const { positions: underlinePositions } = useTextHighlightUnderlines(
    textRef,
    highlightRefs,
    highlightedPhrases,
    getResponsiveOffset()
  );

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
    sortedPhrases.forEach((phraseObj) => {
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
      aria-labelledby={title ? `${id}-title` : undefined}
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
                alt="underline graphic"
                width={position.width}
                height={6}
                style={{
                  width: "100%",
                  height: "clamp(0.1875rem, 1.5vw, 0.375rem)", // Responsive height: smaller on mobile
                  objectFit: "cover", // Changed from "cover" to prevent clipping
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
