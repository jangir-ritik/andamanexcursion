import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface BannerProps extends BaseSectionProps {
  content: BannerContent;
}

export interface BannerContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
}
