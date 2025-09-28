import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import { UpdatedSealinkLuxuryLayout } from "../layouts/UpdatedSealinkLuxuryLayout";
import { UpdatedSealinkRoyalLayout } from "../layouts/UpdatedSealinkRoyalLayout";
import { GreenOceanEconomyLayout } from "../layouts/GreenOceanEconomyLayout";
import { GreenOceanPremiumLayout } from "../layouts/GreenOceanPremiumLayout";
import { GreenOceanRoyalLayout } from "../layouts/GreenOceanRoyalLayout";

export function FerryVesselLayout({
  operator,
  vesselClass,
  ...props
}: FerryVesselLayoutProps) {
  const layoutKey = `${operator}-${vesselClass}`;
  console.log(layoutKey);

  switch (layoutKey) {
    case "sealink-premium":
      return <UpdatedSealinkLuxuryLayout {...props} />;
    case "sealink-economy":
      return <UpdatedSealinkRoyalLayout {...props} />;
    case "greenocean-economy":
      return <GreenOceanEconomyLayout {...props} />;
    case "greenocean-premium":
      return <GreenOceanPremiumLayout {...props} />;
    case "greenocean-royal":
      return <GreenOceanRoyalLayout {...props} />;
    default:
      return <div>Default Ferry Layout</div>;
  }
}
