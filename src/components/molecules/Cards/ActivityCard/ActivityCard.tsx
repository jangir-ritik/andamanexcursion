"use client";

import React, { useState, useCallback } from "react";
import type { ActivityCardProps } from "./ActivityCard.types";
import clsx from "clsx";
import styles from "./ActivityCard.module.css";
import { ImageContainer, Button } from "@/components/atoms";
import clockIcon from "@public/icons/misc/clock.svg";
import snorkelingIcon from "@public/icons/misc/snorkeling.svg";
import Image from "next/image";
import { ImageSlider } from "../FerryCard/components/ImageSlider";
import { ClassCard } from "../common/ClassCard";
import { ChevronDown } from "lucide-react";

export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  description,
  price,
  totalPrice,
  type,
  duration,
  images,
  href,
  className,
  activityOptions = [],
  onSelectActivity,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleAddActivity = useCallback(
    (optionId: string) => {
      if (onSelectActivity) {
        onSelectActivity(id, optionId);
        setIsExpanded(false);
      }
    },
    [id, onSelectActivity]
  );

  const handleSelectOption = useCallback((index: number) => {
    setSelectedOptionIndex(index);
  }, []);

  return (
    <div
      className={clsx(styles.card, className, {
        [styles.expanded]: isExpanded,
      })}
      role="article"
      aria-label={`Activity: ${title}`}
    >
      <div className={styles.contentWrapper}>
        <ImageContainer
          src={images[0].src}
          alt={images[0].alt}
          className={styles.imageWrapper}
        />
        <div className={styles.textContent}>
          <div className={styles.header}>
            <div className={styles.titleContainer}>
              <h3 className={styles.title}>{title}</h3>
              <div className={styles.activityInfo}>
                <div className={styles.durationContainer}>
                  <Image
                    aria-hidden="true"
                    src={clockIcon}
                    alt="Clock icon"
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
                    alt="Snorkeling icon"
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
          </div>

          <p className={styles.description}>{description}</p>

          <Button
            variant={isExpanded ? "outline" : "primary"}
            onClick={toggleExpand}
            className={styles.viewDetailsButton}
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

      {isExpanded && (
        <div className={styles.classesContainer}>
          <div className={styles.classesWrapper}>
            {activityOptions.map((activityOption, index) => (
              <ClassCard
                key={`${activityOption.id}-${index}`}
                classOption={activityOption}
                isActive={index === selectedOptionIndex}
                onSelect={() => handleSelectOption(index)}
                onAction={handleAddActivity}
                showActionButton={index === selectedOptionIndex}
                actionButtonText="Add Activity"
                contentType="activity"
              />
            ))}
          </div>
          <ImageSlider
            images={images.map((image) => image.src)}
            altText={`${title} activity images`}
          />
        </div>
      )}
    </div>
  );
};
