import { ReactNode } from "react";

export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface MediumCardProps extends BaseCardProps {
  badge?: string;
  badgeIcon?: ReactNode;
  description: string;
  href?: string;
  className?: string;
}
