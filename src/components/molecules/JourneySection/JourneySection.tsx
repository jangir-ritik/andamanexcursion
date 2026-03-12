"use client";
import React, { useRef } from 'react';
import Image from "next/image";
import { SectionTitle } from "@/components/atoms";
import styles from "./JourneySection.module.css";

interface Milestone {
  id?: string;
  year: string;
  title: string;
  description: string;
}

interface JourneySectionContent {
  title?: string;
  subtitle?: string;
  milestones: Milestone[];
}

interface JourneySectionProps {
  content: JourneySectionContent;
}

export function JourneySection({ content }: JourneySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  if (!content?.milestones?.length) return null;

  const n = content.milestones.length;
  // Line starts at 182px (ship center), ends at center of last dot.
  // Each item is 337px wide + 63px gap. First item: 124px left margin.
  // Last dot center = 124 (first item left) + (n-1)*(337+63) + 30 (yearRow left) + 14.5 (dot radius)
  const lastDotCenter = 124 + (n - 1) * 400 + 30 + 14.5;
  const lineWidth = Math.max(0, lastDotCenter - 182);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeftPos.current = scrollRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section className={styles.root} aria-label="Our Journey">
      <div className={styles.header}>
        <SectionTitle text={content.title || "Our Journey"} specialWord="Journey" />
      </div>
      <div 
        className={styles.scrollWrapper}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        <div className={styles.track}>
          {/* Horizontal dashed timeline line */}
          <div className={styles.dashedLine} style={{ width: lineWidth }} />

          {content.milestones.map((m, i) => (
            <div
              key={`milestone-${i}`}
              className={`${styles.item} ${i === 0 ? styles.itemFirst : ""}`}
            >
              {/* Year label + marker (dot or ship) */}
              <div className={styles.yearRow}>
                <span
                  className={`${styles.year} ${i === 0 ? styles.yearActive : ""}`}
                >
                  {m.year}
                </span>
                {i === 0 ? (
                  <div className={styles.shipWrapper}>
                    <Image
                      src="/icons/misc/boat.svg"
                      alt="Journey start"
                      width={57}
                      height={50}
                      className={styles.shipImg}
                    />
                  </div>
                ) : (
                  <div className={styles.dot} />
                )}
              </div>

              {/* Milestone card */}
              <div className={styles.card}>
                <div className={styles.cardInner}>
                  <h3 className={styles.cardTitle}>{m.title}</h3>
                  <p className={styles.cardDesc}>{m.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
