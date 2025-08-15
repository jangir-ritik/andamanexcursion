// import React from "react";
// import type { FeaturePackageCardProps } from "./FeaturePackageCard.types";
// import clsx from "clsx";
// import styles from "./FeaturePackageCard.module.css";
// import { ImageContainer, InlineLink } from "@/components/atoms";

// export const FeaturePackageCard: React.FC<FeaturePackageCardProps> = ({
//   title,
//   description,
//   price,
//   originalPrice,
//   locations,
//   duration,
//   image,
//   href,
//   className,
// }) => {
//   // Helper function to format multiple locations
//   const formatLocations = (locations: any[]) => {
//     if (!locations || locations.length === 0) return "";
//     // Extract location names, handling both string IDs and populated objects
//     const locationNames = locations.map((location) => {
//       if (typeof location === "string") {
//         return location;
//       }
//       return location?.name || location?.title || "Unknown Location";
//     });
//     // Format multiple locations with & separator
//     if (locationNames.length === 1) {
//       return locationNames[0];
//     } else if (locationNames.length === 2) {
//       return `${locationNames[0]} & ${locationNames[1]}`;
//     } else if (locationNames.length > 2) {
//       // Show first two and indicate more
//       return `${locationNames[0]} & ${locationNames[1]}`;
//     }
//     return "";
//   };

//   const formattedLocations = formatLocations(locations);

//   // Calculate discount percentage if original price exists
//   const discountPercentage =
//     originalPrice && originalPrice > price
//       ? Math.round(((originalPrice - price) / originalPrice) * 100)
//       : null;

//   return (
//     <div
//       className={clsx(styles.card, className)}
//       role="article"
//       aria-label={`Package: ${title}`}
//     >
//       <div className={styles.contentWrapper}>
//         {/* Image Section */}
//         <div className={styles.imageSection}>
//           <ImageContainer
//             src={image}
//             alt={`${title} package image`}
//             className={styles.imageWrapper}
//           />
//         </div>

//         {/* Content Section - Restructured */}
//         <div className={styles.contentSection}>
//           {/* Top Section: Title, Location & Duration Badge */}
//           <div className={styles.topSection}>
//             <div className={styles.titleGroup}>
//               <h3 className={styles.title}>{title}</h3>

//               {/* Location with Icon */}
//               {formattedLocations && (
//                 <div className={styles.locationGroup}>
//                   <svg
//                     className={styles.locationIcon}
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//                     <circle cx="12" cy="10" r="3" />
//                   </svg>
//                   <span className={styles.location}>{formattedLocations}</span>
//                 </div>
//               )}
//             </div>

//             {/* Duration Badge */}
//             <div className={styles.durationBadge}>{duration}</div>
//           </div>

//           {/* Description */}
//           <p className={styles.description}>{description}</p>

//           {/* Bottom Section: Price & Action */}
//           <div className={styles.bottomSection}>
//             {/* Price Section */}
//             <div className={styles.priceSection}>
//               {/* Discount and Original Price Row */}
//               {originalPrice && originalPrice > price && (
//                 <div className={styles.discountRow}>
//                   <span className={styles.originalPrice}>₹{originalPrice}</span>
//                   {discountPercentage && (
//                     <span className={styles.discountBadge}>
//                       -{discountPercentage}% OFF
//                     </span>
//                   )}
//                 </div>
//               )}

//               {/* Current Price Row */}
//               <div className={styles.currentPriceRow}>
//                 <span className={styles.currentPrice}>₹{price}</span>
//                 <span className={styles.perPerson}>/person</span>
//               </div>
//             </div>

//             {/* Action Button */}
//             <InlineLink
//               href={href}
//               aria-label={`View details for ${title} package`}
//             >
//               View Details
//             </InlineLink>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React from "react";
import type { FeaturePackageCardProps } from "./FeaturePackageCard.types";
import clsx from "clsx";
import styles from "./FeaturePackageCard.module.css";
import { ImageContainer, InlineLink } from "@/components/atoms";

export const FeaturePackageCard: React.FC<FeaturePackageCardProps> = ({
  title,
  description,
  price,
  originalPrice,
  locations,
  duration,
  image,
  href,
  className,
}) => {
  // Helper function to format multiple locations
  const formatLocations = (locations: any[]) => {
    if (!locations || locations.length === 0) return "";
    // Extract location names, handling both string IDs and populated objects
    const locationNames = locations.map((location) => {
      if (typeof location === "string") {
        return location;
      }
      return location?.name || location?.title || "Unknown Location";
    });
    // Format multiple locations with & separator
    if (locationNames.length === 1) {
      return locationNames[0];
    } else if (locationNames.length === 2) {
      return `${locationNames[0]} & ${locationNames[1]}`;
    } else if (locationNames.length > 2) {
      // Show first two and indicate more
      return `${locationNames[0]} & ${locationNames[1]}`;
    }
    return "";
  };

  const formattedLocations = formatLocations(locations);

  // Calculate discount percentage if original price exists
  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <article
      className={clsx(styles.card, className)}
      role="link"
      tabIndex={0}
      onClick={() => (window.location.href = href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = href;
        }
      }}
      aria-label={`View ${title} package details - ${formattedLocations} - ${duration} - ₹${price} per person`}
    >
      <div className={styles.contentWrapper}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <ImageContainer
            src={image}
            alt={`${title} package image`}
            className={styles.imageWrapper}
          />
        </div>

        {/* Content Section - Restructured */}
        <div className={styles.contentSection}>
          {/* Top Section: Title, Location & Duration Badge */}
          <div className={styles.topSection}>
            <div className={styles.titleGroup}>
              <h3 className={styles.title}>{title}</h3>

              {/* Location with Icon */}
              {formattedLocations && (
                <div className={styles.locationGroup}>
                  <svg
                    className={styles.locationIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className={styles.location}>{formattedLocations}</span>
                </div>
              )}
            </div>

            {/* Duration Badge */}
            <div
              className={styles.durationBadge}
              aria-label={`Duration: ${duration}`}
            >
              {duration}
            </div>
          </div>

          {/* Description */}
          <p className={styles.description}>{description}</p>

          {/* Bottom Section: Price & Action */}
          <div className={styles.bottomSection}>
            {/* Price Section */}
            <div className={styles.priceSection}>
              {/* Discount and Original Price Row */}
              {originalPrice && originalPrice > price && (
                <div className={styles.discountRow}>
                  <span
                    className={styles.originalPrice}
                    aria-label={`Original price: ₹${originalPrice}`}
                  >
                    ₹{originalPrice}
                  </span>
                  {discountPercentage && (
                    <span
                      className={styles.discountBadge}
                      aria-label={`${discountPercentage}% discount`}
                    >
                      -{discountPercentage}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* Current Price Row */}
              <div className={styles.currentPriceRow}>
                <span
                  className={styles.currentPrice}
                  aria-label={`Current price: ₹${price} per person`}
                >
                  ₹{price}
                </span>
                <span className={styles.perPerson} aria-hidden="true">
                  /person
                </span>
              </div>
            </div>

            {/* Visual Action Indicator */}
            <div className={styles.actionIndicator} aria-hidden="true">
              <span className={styles.actionText}>View Details</span>
              <svg
                className={styles.actionArrow}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
