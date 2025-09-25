import { UnifiedSeat } from "@/components/molecules/SeatLayout/SeatLayout";
import { SealinkLuxuryLayout } from "../layouts/SealinkLuxuryLayout";
import { SealinkRoyalLayout } from "../layouts/SealinkRoyalLayout";
import { GreenOceanEconomyLayout } from "../layouts/GreenOceanEconomyLayout";
import { GreenOceanPremiumLayout } from "../layouts/GreenOceanPremiumLayout";
import { GreenOceanRoyalLayout } from "../layouts/GreenOceanRoyalLayout";

interface FerryVesselLayoutProps {
  operator: string;
  vesselClass: string;
  seatData: UnifiedSeat[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
}

export function FerryVesselLayout({
  operator,
  vesselClass,
  ...props
}: FerryVesselLayoutProps) {
  const layoutKey = `${operator}-${vesselClass}`;

  switch (layoutKey) {
    case "sealink-luxury":
      return <SealinkLuxuryLayout {...props} />;
    case "sealink-royal":
      return <SealinkRoyalLayout {...props} />;
    case "greenocean-economy":
      return <GreenOceanEconomyLayout {...props} />;
    case "greenocean-premium":
      return <GreenOceanPremiumLayout {...props} />;
    case "greenocean-royal":
      return <GreenOceanRoyalLayout {...props} />;
    default:
      return null;
  }
}
