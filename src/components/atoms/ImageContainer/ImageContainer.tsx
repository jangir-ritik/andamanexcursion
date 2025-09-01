// "use client";
// import React, { useState, useCallback } from "react";
// import Image from "next/image";
// import styles from "./ImageContainer.module.css";
// import type { ImageContainerProps } from "./ImageContainer.types";
// import { useImageSrc, useImageMetadata } from "@/hooks/useImageSrc";
// import { ImageOff } from "lucide-react";

import MediaContainer from "../MediaContainer/MediaContainer";
import { ImageContainerProps } from "./ImageContainer.types";

// export const ImageContainer = ({
//   src,
//   alt,
//   className = "",
//   aspectRatio = "auto",
//   objectFit = "cover",
//   priority = false,
//   fullWidth = false,
//   decorative = false,
//   width,
//   height,
//   fixedSize = false,
// }: ImageContainerProps) => {
//   const [imageError, setImageError] = useState(false);
//   const [imageLoading, setImageLoading] = useState(true);

//   // Smart size selection based on component props
//   const getPreferredSize = (): string => {
//     // If fixed size is specified, choose based on width
//     if (fixedSize && width) {
//       if (width <= 400) return "small";
//       if (width <= 768) return "medium";
//       return "large";
//     }

//     // Choose based on aspect ratio and fullWidth
//     if (fullWidth) {
//       if (aspectRatio === "banner") return "large";
//       return "medium";
//     }

//     // Default size selection
//     switch (aspectRatio) {
//       case "square":
//       case "portrait":
//         return "small";
//       case "landscape":
//       case "banner":
//         return "medium";
//       default:
//         return "medium";
//     }
//   };

//   // Use the hook with smart size selection
//   const {
//     src: processedSrc,
//     isValid,
//     selectedSize,
//     mediaMetadata,
//   } = useImageSrc(src, {
//     preferredSize: getPreferredSize(),
//     containerWidth: width,
//     highDPI:
//       typeof window !== "undefined" ? window.devicePixelRatio > 1 : false,
//     fallbackUrl: "", // Will use fallback UI instead
//     debug: process.env.NODE_ENV === "development",
//   });

//   // Get metadata for potential use (dimensions, etc.)
//   const metadata = useImageMetadata(src);

//   const handleImageError = useCallback(() => {
//     setImageError(true);
//     setImageLoading(false);
//   }, []);

//   const handleImageLoad = useCallback(() => {
//     setImageLoading(false);
//   }, []);

//   // Determine if we should use fixed sizing
//   const useFixedSize = fixedSize || (width && height);

//   // Build container classes - exclude aspect ratio classes if using fixed size
//   const containerClasses = [
//     styles.container,
//     !useFixedSize && styles[aspectRatio], // Only apply aspect ratio if not using fixed size
//     fullWidth && !useFixedSize && styles.fullWidth, // fullWidth doesn't make sense with fixed size
//     imageLoading && styles.loading,
//     imageError && styles.error,
//     useFixedSize && styles.fixedSize, // New class for fixed size styling
//     className,
//   ]
//     .filter(Boolean)
//     .join(" ");

//   // Generate inline styles for fixed dimensions
//   const containerStyle =
//     useFixedSize && width && height
//       ? {
//           width: `${width}px`,
//           height: `${height}px`,
//           minHeight: `${height}px`, // Override the auto aspect ratio min-height
//         }
//       : undefined;

//   // Debug logging in development
//   if (process.env.NODE_ENV === "development" && selectedSize) {
//     console.log(`ImageContainer: Using ${selectedSize} size for`, alt);
//   }

//   // Show error fallback if image failed to load or source is invalid
//   if (imageError || !isValid || !processedSrc) {
//     return (
//       <div
//         className={containerClasses}
//         style={containerStyle}
//         role="img"
//         aria-label={alt}
//       >
//         <div className={styles.errorFallback}>
//           <div className={styles.errorIcon}>
//             <ImageOff
//               stroke={"var(--color-gray-400)"}
//               size={useFixedSize ? Math.min(width || 32, height || 32, 32) : 32}
//             />
//           </div>
//           <div className={styles.errorText}>Preview not available</div>
//         </div>
//       </div>
//     );
//   }

//   // Render loading state
//   const renderLoading = () => (
//     <div className={styles.loadingOverlay}>
//       <div className={styles.loadingSpinner} />
//     </div>
//   );

//   // Simplified sizes generation - no complex responsive logic needed
//   const generateSizes = () => {
//     if (useFixedSize && width) {
//       return `${width}px`;
//     }
//     if (fullWidth) return "100vw";
//     // Simplified responsive sizes
//     return "(max-width: 768px) 100vw, 50vw";
//   };

//   return (
//     <div
//       className={containerClasses}
//       style={containerStyle}
//       role={decorative ? "presentation" : "img"}
//       aria-label={decorative ? undefined : alt}
//     >
//       {imageError ? (
//         <div
//           className={styles.fallback}
//           role="img"
//           aria-label={alt || "Image unavailable"}
//         >
//           <div className={styles.fallbackContent}>
//             <svg
//               width={
//                 useFixedSize ? Math.min(width || 48, height || 48, 48) : 48
//               }
//               height={
//                 useFixedSize ? Math.min(width || 48, height || 48, 48) : 48
//               }
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1"
//               className={styles.fallbackIcon}
//             >
//               <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
//               <circle cx="8.5" cy="8.5" r="1.5" />
//               <polyline points="21,15 16,10 5,21" />
//             </svg>
//             <span className={styles.fallbackText}>
//               {alt || "Image unavailable"}
//             </span>
//           </div>
//         </div>
//       ) : (
//         <>
//           <Image
//             src={processedSrc}
//             alt={alt || ""}
//             fill={!useFixedSize} // Only use fill when not using fixed size
//             width={useFixedSize ? width : undefined}
//             height={useFixedSize ? height : undefined}
//             className={styles[objectFit]}
//             priority={priority}
//             onError={handleImageError}
//             onLoad={handleImageLoad}
//             sizes={generateSizes()}
//             // Simplified - no blur placeholder since images are pre-optimized
//           />
//           {imageLoading && renderLoading()}
//         </>
//       )}
//     </div>
//   );
// };

// export default ImageContainer;

// Simple wrapper for image-only use cases (As both are doing the same thing essentially)
export const ImageContainer = (props: ImageContainerProps) => {
  return <MediaContainer {...props} />;
};