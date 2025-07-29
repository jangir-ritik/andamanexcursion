"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./ClassCard.module.css";
import { Button } from "@/components/atoms";
import poolIcon from "@public/icons/misc/poolLadder.svg";
import { Plus } from "lucide-react";

export interface ClassOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  seatsLeft?: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
  description?: string;
  images?: {
    src: string;
    alt: string;
  }[];
}

interface ClassCardProps {
  classOption: ClassOption;
  isActive: boolean;
  onSelect: () => void;
  onAction?: (classType: string) => void;
  showActionButton?: boolean;
  actionButtonText?: string;
  contentType: "ferry" | "activity";
}

export const ClassCard: React.FC<ClassCardProps> = memo(
  ({
    classOption,
    isActive,
    onSelect,
    onAction,
    showActionButton = false,
    actionButtonText = "Select",
    contentType,
  }) => {
    // Generate base IDs
    const cardId = `${contentType}-class-${classOption.type
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const priceId = `${cardId}-price`;
    const amenitiesId = `${cardId}-amenities`;
    const alertId = `${cardId}-alert`;

    // Simple calculations
    const shouldShowAlert =
      classOption.seatsLeft !== undefined && classOption.seatsLeft <= 10;
    const seatText =
      classOption.seatsLeft !== undefined
        ? `${classOption.seatsLeft} seat${
            classOption.seatsLeft !== 1 ? "s" : ""
          }`
        : "";
    const cardClassName = cn(
      styles.classCard,
      isActive ? styles.activeClass : styles.inactiveClass
    );

    // Build ARIA description
    const ariaIds = [priceId];
    if (classOption.amenities) ariaIds.push(amenitiesId);
    if (shouldShowAlert) ariaIds.push(alertId);
    const ariaDescribedBy = ariaIds.join(" ");

    // Event handlers
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Stop event bubbling
        onSelect();
      },
      [onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }
      },
      [onSelect]
    );

    const handleAction = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Stop event bubbling
        onAction?.(classOption.id);
      },
      [onAction, classOption.id]
    );

    return (
      <article
        id={cardId}
        className={cardClassName}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="option"
        aria-selected={isActive}
        aria-describedby={ariaDescribedBy}
      >
        <header className={styles.classHeader}>
          <div className={styles.classInfo}>
            <div className={styles.typeIconContainer}>
              <span className={styles.typeIcon}>
                <Image
                  src={poolIcon}
                  alt={classOption.type}
                  aria-hidden="true"
                  width={18}
                  height={18}
                />
              </span>
              <h3 className={styles.className} id={`${cardId}-title`}>
                {classOption.type}
              </h3>
            </div>

            {shouldShowAlert && (
              <div
                className={styles.seatsAlert}
                role="alert"
                id={alertId}
                aria-live="polite"
                aria-atomic="true"
              >
                <AlertCircle
                  className={styles.alertIcon}
                  size={16}
                  aria-hidden="true"
                />
                <span className={styles.alertText}>
                  <strong>Hurry!</strong> Only {seatText} left
                </span>
              </div>
            )}
          </div>
          <div className={styles.classPriceInfo} id={priceId}>
            <div className={styles.pricePerAdult}>
              <span>₹{classOption.price}/adult</span>
            </div>
            <div className={styles.totalPrice}>
              <span>₹{classOption.totalPrice}/- total</span>
            </div>
          </div>
        </header>

        <section className={styles.contentContainer}>
          {classOption.description && (
            <p className={styles.description}>{classOption.description}</p>
          )}

          {/* Gallery Section */}
          {classOption.images && classOption.images.length > 0 && (
            <div className={styles.galleryContainer}>
              <div className={styles.galleryImages}>
                {classOption.images.slice(0, 3).map((image, index) => (
                  <div key={index} className={styles.galleryImage}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
                {classOption.images.length > 3 && (
                  <div className={styles.moreImages}>
                    +{classOption.images.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {showActionButton && onAction && (
            <Button
              type="button"
              variant="primary"
              aria-describedby={`${cardId}-title ${priceId}`}
              onClick={handleAction}
              className={styles.addActivityButton}
              icon={<Plus size={16} aria-hidden="true" />}
            >
              {actionButtonText}
            </Button>
          )}
        </section>
      </article>
    );
  }
);

ClassCard.displayName = "ClassCard";
