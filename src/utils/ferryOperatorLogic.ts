import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";

/**
 * Check if ferry operator should show seat preference options
 */
export const shouldShowSeatPreference = (ferry: UnifiedFerryResult): boolean => {
  return (
    ferry.features.supportsAutoAssignment &&
    ferry.features.supportsSeatSelection &&
    ferry.operator !== "sealink"
  );
};

/**
 * Check if operator requires manual seat selection
 */
export const requiresManualSelection = (ferry: UnifiedFerryResult): boolean => {
  return (
    ferry.operator === "greenocean" ||
    ferry.operator === "sealink" ||
    !ferry.features.supportsAutoAssignment
  );
};

/**
 * Check if operator supports both auto and manual preferences
 */
export const supportsBothPreferences = (ferry: UnifiedFerryResult): boolean => {
  return (
    ferry.features.supportsSeatSelection &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink"
  );
};

/**
 * Get default seat preference for operator
 */
export const getDefaultSeatPreference = (ferry: UnifiedFerryResult): "manual" | "auto" => {
  if (requiresManualSelection(ferry)) {
    return "manual";
  }
  
  if (supportsBothPreferences(ferry)) {
    return "auto"; // Default to auto for operators like Makruzz
  }
  
  return "manual";
};

/**
 * Check if seat layout should be loaded automatically
 */
export const shouldLoadSeatLayoutAutomatically = (ferry: UnifiedFerryResult): boolean => {
  return (
    (ferry.operator === "greenocean" || ferry.operator === "sealink") &&
    ferry.features.supportsSeatSelection
  );
};

/**
 * Check if operator supports only auto-assignment
 */
export const supportsOnlyAutoAssignment = (ferry: UnifiedFerryResult): boolean => {
  return (
    !ferry.features.supportsSeatSelection &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink"
  );
};
