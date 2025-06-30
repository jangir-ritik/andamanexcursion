import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface HiddenGemsProps extends BaseSectionProps {
  className?: string;
  children?: ReactNode;
}

export interface GemItem {
  title: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
}

export interface HiddenGemsContent {
  title: string;
  specialWord: string;
  description: string;
  gems: GemItem[];
}
