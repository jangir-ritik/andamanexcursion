"use client";

import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import type { ActivityCardProps } from "./ActivityCard.types";
import clsx from "clsx";
import styles from "./ActivityCard.module.css";
import { Button, ImageContainer } from "@/components/atoms";
import clockIcon from "@public/icons/misc/clock.svg";
import snorkelingIcon from "@public/icons/misc/snorkeling.svg";
import Image from "next/image";
import { ImageSlider } from "../FerryCard/components/ImageSlider";
import { ClassCard } from "../ClassCard/ClassCard";
import { ChevronDown, Clock, MapPin, Waves } from "lucide-react";

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  description,
  images,
  price,
  totalPrice,
  originalPrice,
  originalTotalPrice,
  type,
  duration,
  availableTimeSlots = [],
  href,
  className,
  activityOptions = [],
  onSelectActivity,
  selectedOptionId,
  totalGuests,
  location,
  timeSlots = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Success state
  const [addedActivityId, setAddedActivityId] = useState<string | null>(null);

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

        // Show success feedback
        setAddedActivityId(optionId);

        // Clear success feedback after 3 seconds
        setTimeout(() => {
          setAddedActivityId(null);
        }, 3000);
      }
    },
    [id, onSelectActivity]
  );

  // Optimized option selection handler
  const handleSelectOption = useCallback((index: number) => {
    setSelectedOptionIndex(index);
  }, []);

  // Prevent any potential navigation when card is expanded
  // const handleCardClick = useCallback(
  //   (e: React.MouseEvent) => {
  //     if (isExpanded) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   },
  //   [isExpanded]
  // );
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't expand if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }

    setIsExpanded((prev) => !prev);
  }, []);

  // Calculate discount percentage if original prices exist
  const discountPercentage = useMemo(() => {
    if (originalPrice && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return null;
  }, [originalPrice, price]);

  const totalDiscountPercentage = useMemo(() => {
    if (originalTotalPrice && originalTotalPrice > totalPrice) {
      return Math.round(
        ((originalTotalPrice - totalPrice) / originalTotalPrice) * 100
      );
    }
    return null;
  }, [originalTotalPrice, totalPrice]);

  // Separate gallery images from featured image for slider
  const galleryImages = React.useMemo(
    () => images.slice(1).map((image) => image.src),
    [images]
  );

  // Get properly formatted time slots for display
  const displayTimeSlots = useMemo(() => {
    if (!availableTimeSlots?.length) return [];
    return availableTimeSlots.filter((slot) => slot.isAvailable);
  }, [availableTimeSlots]);

  return (
    <article
      className={clsx(styles.card, className, {
        [styles.expanded]: isExpanded,
      })}
      role="button"
      aria-label={`Activity: ${title}`}
      onClick={handleCardClick}
    >
      <div className={styles.contentWrapper}>
        {/* Image Section */}
        <div className={styles.imageWrapper}>
          <ImageContainer src={images[0].src} alt={images[0].alt} />
        </div>

        {/* Content Section - New improved layout */}
        <div className={styles.textContent}>
          {/* TOP ROW: Title and Pricing */}
          <div className={styles.topRow}>
            <div className={styles.titleSection}>
              <div className={styles.activityMetadata}>
                {type && (
                  <div className={styles.typeContainer}>
                    {/* <Waves size={16} color="var(--color-primary)" /> */}
                    <span className={styles.type}>{type}</span>
                  </div>
                )}
                {duration && (
                  <div className={styles.durationContainer}>
                    <Clock
                      size={16}
                      className={styles.durationIcon}
                      color="var(--color-text-secondary)"
                    />
                    <span className={styles.duration}>{duration}</span>
                  </div>
                )}
                {location && (
                  <div className={styles.locationContainer}>
                    <MapPin size={16} color="var(--color-text-secondary)" />
                    <span className={styles.location}>{location}</span>
                  </div>
                )}
              </div>
              <h3 className={styles.title}>{title}</h3>
              {/* SECOND ROW: Activity Info */}
            </div>

            {/* Pricing Section - Redesigned for clarity */}
            <div className={styles.pricingSection}>
              {/* Main Price */}
              {discountPercentage && (
                <span
                  className={styles.discountBadge}
                  aria-label={`${discountPercentage}% discount`}
                >
                  -{discountPercentage}% OFF
                </span>
              )}
              <div className={styles.mainPriceRow}>
                <span
                  className={styles.originalPrice}
                  aria-label={`Original price: ₹${originalPrice}`}
                >
                  ₹{originalPrice}
                </span>
                <span
                  className={styles.currentPrice}
                  aria-label={`Current price: ₹${price} per adult`}
                >
                  ₹{price}
                </span>
                <span className={styles.perPerson} aria-hidden="true">
                  /adult
                </span>
              </div>

              {/* Total Price Info */}
              <div className={styles.totalPriceInfo}>
                {originalTotalPrice && originalTotalPrice > totalPrice && (
                  <span
                    className={styles.originalTotalPrice}
                    aria-label={`Original total: ₹${originalTotalPrice}`}
                  >
                    ₹{originalTotalPrice}
                  </span>
                )}
                <span
                  className={styles.totalPrice}
                  aria-label={`Total price: ₹${totalPrice}`}
                >
                  ₹{totalPrice}
                </span>
                <span className={styles.totalLabel} aria-hidden="true">
                  /total
                </span>
              </div>
            </div>
          </div>

          {/* THIRD ROW: Available Times */}
          {displayTimeSlots.length > 0 && (
            <div className={styles.timeSlotsRow}>
              <h4 className={styles.timeSlotsTitle}>Available Times</h4>
              <div className={styles.timeSlotsList}>
                {displayTimeSlots.slice(0, 4).map((slot) => (
                  <span key={slot.id} className={styles.timeSlot}>
                    {slot.displayTime}
                  </span>
                ))}
                {displayTimeSlots.length > 4 && (
                  <span className={styles.moreSlots}>
                    +{displayTimeSlots.length - 4} more times
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FOURTH ROW: Description and Toggle Details */}
          <div className={styles.bottomRow}>
            <p className={styles.description}>{description}</p>
            <Button
              variant="secondary"
              onClick={toggleExpand}
              type="button"
              size="small"
              // className={styles.viewDetailsButton}
              aria-expanded={isExpanded}
              icon={
                <ChevronDown
                  strokeWidth={2}
                  size={16}
                  aria-hidden="true"
                  className={clsx(styles.chevronIcon, {
                    [styles.chevronExpanded]: isExpanded,
                  })}
                />
              }
            >
              {isExpanded ? "Hide Details" : "View Details"}
            </Button>
          </div>
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
                isAdded={addedActivityId === activityOption.id}
              />
            ))}
          </div>

          {/* Image Slider */}
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
