import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface WhyChooseUsProps extends BaseSectionProps {}

export interface PointItem {
  id: string;
  title: string;
  description: string;
}

export interface WhyChooseUsContent {
  title: string;
  specialWord: string;
  description: string;
  points: PointItem[];
  image: string;
  ctaText: string;
  ctaHref: string;
}
