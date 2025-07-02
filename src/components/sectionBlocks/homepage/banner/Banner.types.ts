import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface BannerProps extends BaseSectionProps {}

export interface BannerContent {
  title: string;
  specialWord: string;
  subtitle: string;
  image: {
    src: string;
  };
  imageAlt: string;
}
