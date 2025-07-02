import { ReactNode } from "react";
import { FAQItem } from "@/components/molecules/FAQContainer/FAQContainer.types";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface FaqProps {
  title: string;
  description?: string;
}

export interface FAQProps extends BaseSectionProps {
  title: string;
  specialWord?: string;
  items: FAQItem[];
  className?: string;
}

export interface FAQContent {
  title: string;
  specialWord?: string;
  description?: string;
  items: FAQItem[];
}
