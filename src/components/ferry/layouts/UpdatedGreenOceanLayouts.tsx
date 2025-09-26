import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import { DefaultFerryLayout } from "./DefaultFerryLayout";

export function UpdatedGreenOceanEconomyLayout(props: Omit<FerryVesselLayoutProps, 'operator' | 'vesselClass'>) {
    // For now, use the default layout - can be customized later with specific Green Ocean economy design
    return <DefaultFerryLayout {...props} />;
}

export function UpdatedGreenOceanPremiumLayout(props: Omit<FerryVesselLayoutProps, 'operator' | 'vesselClass'>) {
    // For now, use the default layout - can be customized later with specific Green Ocean premium design
    return <DefaultFerryLayout {...props} />;
}

export function UpdatedGreenOceanRoyalLayout(props: Omit<FerryVesselLayoutProps, 'operator' | 'vesselClass'>) {
    // For now, use the default layout - can be customized later with specific Green Ocean royal design
    return <DefaultFerryLayout {...props} />;
}
