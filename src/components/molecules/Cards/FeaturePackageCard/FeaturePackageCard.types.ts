import { Location } from "@payload-types";

export interface FeaturePackageCardProps {
  title: string;
  description: string;
  price: number;
  location: Location;
  duration: string;
  image: string;
  href: string;
  className?: string;
}
