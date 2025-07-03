import { Column, Section } from "@/components/layout";
import React, { useRef, useEffect, useState } from "react";
import styles from "./Trivia.module.css";
import Image from "next/image";
import underlineGraphic from "@public/graphics/underline.svg";

export const Trivia = () => {
  const [underlinePosition, setUnderlinePosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const textRef = useRef<HTMLParagraphElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  // Calculate underline position
  const calculateUnderlineMetrics = () => {
    if (textRef.current && highlightRef.current) {
      const textRect = textRef.current.getBoundingClientRect();
      const highlightRect = highlightRef.current.getBoundingClientRect();

      // Calculate position relative to the text container
      const left = highlightRect.left - textRect.left;
      const top = highlightRect.bottom - textRect.top;

      setUnderlinePosition({
        left,
        top: top - 8,
        width: highlightRect.width,
      });
    }
  };

  // Calculate underline metrics when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(calculateUnderlineMetrics, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle resize for responsive updates
  useEffect(() => {
    const handleResize = () => {
      calculateUnderlineMetrics();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Section
      id="trivia"
      aria-labelledby="trivia-title"
      className={styles.triviaSection}
    >
      <Column
        fullWidth
        gap="var(--space-6)"
        className={styles.contentContainer}
      >
        <h2 id="trivia-title" className={styles.triviaTitle}>
          Did you know?
        </h2>
        <div className={styles.triviaContent}>
          <p ref={textRef} className={styles.triviaText}>
            Port Blair is home to the iconic{" "}
            <span ref={highlightRef} className={styles.highlight}>
              Cellular Jail
            </span>
            , a <span className={styles.highlight}>historic symbol</span> of
            India&apos;s freedom struggle
          </p>
          {underlinePosition && (
            <div
              className={styles.underlineWrapper}
              style={{
                left: `${underlinePosition.left}px`,
                top: `${underlinePosition.top}px`,
                width: `${underlinePosition.width}px`,
              }}
            >
              <Image
                src={underlineGraphic}
                alt="underline"
                width={underlinePosition.width}
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
          )}
        </div>
      </Column>
    </Section>
  );
};
