import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface PartnersProps extends BaseSectionProps {
  className?: string;
  children?: ReactNode;
}

export interface PartnerItem {
  name: string;
  logo: {
    src: string;
  };
  alt: string;
}

export interface PartnersContent {
  title: string;
  specialWord: string;
  description: string;
  partners: PartnerItem[];
}
