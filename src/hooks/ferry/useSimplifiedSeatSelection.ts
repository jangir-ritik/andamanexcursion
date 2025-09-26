import { useState, useEffect, useCallback } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { Seat } from "@/types/SeatSelection.types";
import { useFerryStore } from "@/store/FerryStore";
import { validateSeatSelection } from "@/utils/ferryValidation";

interface UseSimplifiedSeatSelectionReturn {
  selectedSeats: string[];
  handleSeatSelect: (seatId: string) => void;
  canProceed: boolean;
  validationMessage: string | null;
  clearSelection: () => void;
}

/**
 * Simplified Seat Selection Hook
 * 
 * This replaces the complex useSeatSelection hook with:
 * 1. Direct Seat[] array handling instead of SeatLayout object
 * 2. Simplified state management
 * 3. Better integration with simplified seat system
 */
export const useSimplifiedSeatSelection = (
  ferry: UnifiedFerryResult | null,
  passengers: number,
  seats: Seat[] = []
): UseSimplifiedSeatSelectionReturn => {
  const { selectSeats } = useFerryStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatSelect = useCallback(
    (seatId: string) => {
      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          // Deselect seat
          return prev.filter((id) => id !== seatId);
        } else {
          // Select seat - check if we've reached the passenger limit
          if (prev.length >= passengers) {
            // Replace the first selected seat with the new one (FIFO)
            return [...prev.slice(1), seatId];
          } else {
            // Add the new seat
            return [...prev, seatId];
          }
        }
      });
    },
    [passengers]
  );

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  // Update store when local seat selection changes and we have seats
  useEffect(() => {
    if (seats.length > 0 && selectedSeats.length > 0) {
      const selectedSeatObjects = selectedSeats
        .map((seatId) => seats.find((s) => s.id === seatId))
        .filter((seat): seat is Seat => seat !== undefined);
      selectSeats(selectedSeatObjects);
    } else {
      selectSeats([]);
    }
  }, [selectedSeats, seats, selectSeats]);

  // Validation
  const validation = ferry
    ? validateSeatSelection(selectedSeats, passengers, ferry)
    : { isValid: false };
  const canProceed = validation.isValid;
  const validationMessage = validation.message || null;

  return {
    selectedSeats,
    handleSeatSelect,
    canProceed,
    validationMessage,
    clearSelection,
  };
};
