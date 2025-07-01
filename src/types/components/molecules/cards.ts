import { ReactNode } from "react";

export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface SmallCardProps extends BaseCardProps {
  duration: string;
  price: string;
  href?: string;
}

export interface MediumCardProps extends BaseCardProps {
  badge?: string;
  badgeIcon?: ReactNode;
  description: string;
  href?: string;
  className?: string;
}

export interface LargeCardProps extends BaseCardProps {
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface PackageCardProps {
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  href?: string;
  className?: string;
}

export interface FeaturePackageCardProps {
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  image: string;
  href: string;
  className?: string;
}
