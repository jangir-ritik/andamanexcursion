import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

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
