import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface ScubaDivingCTAProps {
  className?: string;
  children?: ReactNode;
}

export interface ScubaDivingProps extends BaseSectionProps {}

export interface ScubaDivingContent {
  title: string;
  specialWord: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  image: {
    src: string;
  };
  imageAlt: string;
}
