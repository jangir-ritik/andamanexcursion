import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import { UpdatedSealinkLuxuryLayout } from "../layouts/UpdatedSealinkLuxuryLayout";
import { UpdatedSealinkRoyalLayout } from "../layouts/UpdatedSealinkRoyalLayout";
import {
  UpdatedGreenOceanEconomyLayout,
  UpdatedGreenOceanPremiumLayout,
  UpdatedGreenOceanRoyalLayout,
} from "../layouts/UpdatedGreenOceanLayouts";
import { DefaultFerryLayout } from "../layouts/DefaultFerryLayout";

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
      return <UpdatedGreenOceanEconomyLayout {...props} />;
    case "greenocean-premium":
      return <UpdatedGreenOceanPremiumLayout {...props} />;
    case "greenocean-royal":
      return <UpdatedGreenOceanRoyalLayout {...props} />;
    default:
      return <DefaultFerryLayout {...props} />;
  }
}
