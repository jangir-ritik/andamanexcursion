import { ReactNode } from "react";

export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface SmallCardProps extends BaseCardProps {
  duration: string;
  price: string;
}

export interface MediumCardProps extends BaseCardProps {
  badge?: string;
  badgeIcon?: ReactNode;
  description: string;
}

export interface LargeCardProps extends BaseCardProps {
  subtitle?: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}
