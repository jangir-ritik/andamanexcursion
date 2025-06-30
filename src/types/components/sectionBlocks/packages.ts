import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface PackagesProps extends BaseSectionProps {}

export interface PackageCardItem {
  title: string;
  image: {
    src: string;
  };
  imageAlt: string;
  duration: string;
  price: string;
  href: string;
}

export interface PackagesContent {
  packages: PackageCardItem[];
}
