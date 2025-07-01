import { ReactNode } from "react";
import { BaseSectionProps } from "./common";
import { FAQItem } from "../molecules/faqContainer";

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
  faqs: FAQItem[];
  items: FAQItem[];
}
