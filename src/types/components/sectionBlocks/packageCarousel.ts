import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface PackageCarouselProps extends BaseSectionProps {
  className?: string;
  children?: ReactNode;
}

export interface PackageItem {
  title: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
  price: string;
  href: string;
}

export interface PackageCarouselContent {
  title: string;
  specialWord: string;
  description: string;
  packages: PackageItem[];
}
