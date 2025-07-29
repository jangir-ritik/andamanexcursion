"use client";

import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import type { ActivityCardProps } from "./ActivityCard.types";
import clsx from "clsx";
import styles from "./ActivityCard.module.css";
import { ImageContainer, Button } from "@/components/atoms";
import clockIcon from "@public/icons/misc/clock.svg";
import snorkelingIcon from "@public/icons/misc/snorkeling.svg";
import Image from "next/image";
import { ImageSlider } from "../FerryCard/components/ImageSlider";
import { ClassCard } from "../ClassCard/ClassCard";
import { ChevronDown } from "lucide-react";

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  description,
  images,
  price,
  totalPrice,
  type,
  duration,
  href,
  className,
  activityOptions = [],
  onSelectActivity,
  selectedOptionId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find the initial selected option index based on selectedOptionId
  const initialSelectedIndex = useMemo(() => {
    if (selectedOptionId && activityOptions.length > 0) {
      const foundIndex = activityOptions.findIndex(
        (option) => option.id === selectedOptionId
      );
      return foundIndex >= 0 ? foundIndex : 0;
    }
    return 0;
  }, [selectedOptionId, activityOptions]);

  const [selectedOptionIndex, setSelectedOptionIndex] =
    useState(initialSelectedIndex);

  // Update selectedOptionIndex when selectedOptionId changes (for edit mode)
  useEffect(() => {
    if (selectedOptionId && activityOptions.length > 0) {
      const foundIndex = activityOptions.findIndex(
        (option) => option.id === selectedOptionId
      );
      if (foundIndex >= 0) {
        setSelectedOptionIndex(foundIndex);
      }
    }
  }, [selectedOptionId, activityOptions]);

  // Optimized toggle handler with explicit event handling
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  // Optimized add activity handler
  const handleAddActivity = useCallback(
    (optionId: string) => {
      if (onSelectActivity) {
        onSelectActivity(id, optionId);
        // Auto-collapse after adding to provide visual feedback
        setIsExpanded(false);
      }
    },
    [id, onSelectActivity]
  );

  // Optimized option selection handler
  const handleSelectOption = useCallback((index: number) => {
    setSelectedOptionIndex(index);
  }, []);

  // Prevent any potential navigation when card is expanded
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (isExpanded) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isExpanded]
  );

  // Memoize button text and icon rotation
  const buttonProps = React.useMemo(
    () => ({
      text: isExpanded ? "Hide Details" : "View Details",
      variant: isExpanded ? ("outline" as const) : ("primary" as const),
      iconClassName: clsx(styles.chevronIcon, {
        [styles.chevronExpanded]: isExpanded,
      }),
    }),
    [isExpanded]
  );

  // Separate gallery images from featured image for slider
  const galleryImages = React.useMemo(
    () => images.slice(1).map((image) => image.src), // Skip the first image (featured)
    [images]
  );

  return (
    <article
      className={clsx(styles.card, className, {
        [styles.expanded]: isExpanded,
      })}
      role="article"
      aria-label={`Activity: ${title}`}
      onClick={handleCardClick}
    >
      <div className={styles.contentWrapper}>
        <ImageContainer
          src={images[0].src}
          alt={images[0].alt}
          className={styles.imageWrapper}
        />

        <div className={styles.textContent}>
          <header className={styles.header}>
            <div className={styles.titleContainer}>
              <h3 className={styles.title}>{title}</h3>
              <div className={styles.activityInfo}>
                <div className={styles.durationContainer}>
                  <Image
                    aria-hidden="true"
                    src={clockIcon}
                    alt=""
                    className={styles.durationIcon}
                    width={18}
                    height={18}
                  />
                  <span className={styles.duration}>{duration}</span>
                </div>
                <div className={styles.typeContainer}>
                  <Image
                    aria-hidden="true"
                    src={snorkelingIcon}
                    alt=""
                    className={styles.durationIcon}
                    width={18}
                    height={18}
                  />
                  <span className={styles.type}>{type}</span>
                </div>
              </div>
            </div>

            <div className={styles.priceContainer}>
              <p className={styles.pricePerAdult}>₹{price}/adult</p>
              <p className={styles.totalPrice}>₹{totalPrice}/- total</p>
            </div>
          </header>

          <p className={styles.description}>{description}</p>

          <Button
            variant={buttonProps.variant}
            onClick={toggleExpand}
            className={styles.viewDetailsButton}
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`${id}-details`}
            icon={
              <ChevronDown
                strokeWidth={2}
                size={16}
                aria-hidden="true"
                className={buttonProps.iconClassName}
              />
            }
          >
            {buttonProps.text}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <section
          className={styles.classesContainer}
          id={`${id}-details`}
          role="region"
          aria-label={`${title} booking options`}
        >
          <div className={styles.classesWrapper}>
            {activityOptions.map((activityOption, index) => (
              <ClassCard
                key={activityOption.id}
                classOption={activityOption}
                isActive={index === selectedOptionIndex}
                onSelect={() => handleSelectOption(index)}
                onAction={() => handleAddActivity(activityOption.id)}
                showActionButton={index === selectedOptionIndex}
                actionButtonText="Add Activity"
                contentType="activity"
              />
            ))}
          </div>

          {/* Only show ImageSlider if there are gallery images, otherwise show placeholder */}
          <ImageSlider
            images={galleryImages}
            altText={`${title} activity gallery`}
          />
        </section>
      )}
    </article>
  );
};

// Export memoized component for performance
export default memo(ActivityCard);
