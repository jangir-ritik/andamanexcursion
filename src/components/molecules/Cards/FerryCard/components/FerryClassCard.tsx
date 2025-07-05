import React, { memo, useCallback } from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "../FerryCard.module.css";
import type { FerryClassOption } from "../FerryCard.types";
import { Button } from "@/components/atoms";
import { ferryCardContent } from "../FerryCard.content";

interface FerryClassCardProps {
  ferryClass: FerryClassOption;
  isActive: boolean;
  onChooseSeats: (classType: string) => void;
  onSelect: () => void;
  showChooseButton: boolean;
}

export const FerryClassCard: React.FC<FerryClassCardProps> = memo(
  ({ ferryClass, isActive, onChooseSeats, onSelect, showChooseButton }) => {
    // Generate base IDs directly - no need for useMemo for these simple operations
    const cardId = `ferry-class-${ferryClass.type
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const priceId = `${cardId}-price`;
    const amenitiesId = `${cardId}-amenities`;
    const alertId = `${cardId}-alert`;

    // Simple calculations - no need for useMemo
    const shouldShowAlert = ferryClass.seatsLeft <= 3;
    const seatText = `${ferryClass.seatsLeft} seat${
      ferryClass.seatsLeft !== 1 ? "s" : ""
    }`;
    const cardClassName = cn(
      styles.classCard,
      isActive ? styles.activeClass : styles.inactiveClass
    );

    // Simplified ARIA label
    const ariaLabel = `${ferryClass.type} ${
      ferryCardContent.aria.ferryTicketOption
    } ${ferryClass.price} ${ferryCardContent.price.perAdult}, ${
      ferryCardContent.price.totalPrice
    } ${ferryClass.totalPrice} ${ferryCardContent.price.rupees}. ${
      shouldShowAlert
        ? `${ferryCardContent.only} ${seatText} ${ferryCardContent.aria.remaining}.`
        : ""
    }`;

    // Build ARIA description directly
    const ariaIds = [priceId, amenitiesId];
    if (shouldShowAlert) ariaIds.push(alertId);
    const ariaDescribedBy = ariaIds.join(" ");

    // Optimize event handlers
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
      },
      [onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      },
      [onSelect]
    );

    const handleChooseSeats = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChooseSeats(ferryClass.type);
      },
      [onChooseSeats, ferryClass.type]
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
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <header className={styles.classHeader}>
          <div className={styles.classInfo}>
            <h3 className={styles.className} id={`${cardId}-title`}>
              {ferryClass.type} {ferryCardContent.class}
            </h3>
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
                  <strong>{ferryCardContent.hurry}</strong>{" "}
                  {ferryCardContent.only} {seatText} {ferryCardContent.left}
                </span>
              </div>
            )}
          </div>
          <div className={styles.classPriceInfo} id={priceId}>
            <div className={styles.pricePerAdult}>
              <span
                aria-label={`${ferryClass.price} ${ferryCardContent.price.perAdult}`}
              >
                {ferryCardContent.price.rupeeSymbol}
                {ferryClass.price}
                {ferryCardContent.perAdult}
              </span>
            </div>
            <div className={styles.totalPrice}>
              <span
                aria-label={`${ferryCardContent.price.totalPrice} ${ferryClass.totalPrice} ${ferryCardContent.price.rupees}`}
              >
                {ferryCardContent.price.rupeeSymbol}
                {ferryClass.totalPrice}
                {ferryCardContent.total}
              </span>
            </div>
          </div>
        </header>

        <section className={styles.amenitiesContainer}>
          <div
            className={styles.amenitiesGroup}
            role="list"
            id={amenitiesId}
            aria-label={`${ferryCardContent.amenitiesIncluded} ${ferryClass.type} class`}
          >
            {ferryClass.amenities.map((amenity, i) => (
              <AmenityItem
                key={`${amenity.label}-${i}`}
                amenity={amenity}
                classType={ferryClass.type}
              />
            ))}
          </div>
          {showChooseButton && (
            <Button
              showArrow
              type="button"
              variant="primary"
              aria-describedby={`${cardId}-title ${priceId}`}
              onClick={handleChooseSeats}
            >
              {ferryCardContent.chooseSeats}
            </Button>
          )}
        </section>
      </article>
    );
  }
);

// Simplified AmenityItem component
const AmenityItem = memo<{
  amenity: { icon: string; label: string };
  classType: string;
}>(({ amenity, classType }) => (
  <div
    className={styles.amenityItem}
    role="listitem"
    aria-label={`${amenity.label} ${ferryCardContent.amenitiesIncluded} ${classType} class`}
  >
    <div className={styles.amenityIcon} aria-hidden="true">
      <Image
        src={amenity.icon}
        alt=""
        width={18}
        height={18}
        aria-hidden="true"
      />
    </div>
    <span className={styles.amenityLabel}>{amenity.label}</span>
  </div>
));

AmenityItem.displayName = "AmenityItem";
FerryClassCard.displayName = "FerryClassCard";
