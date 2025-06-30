import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

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
