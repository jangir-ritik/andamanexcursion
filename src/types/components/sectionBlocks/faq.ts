import { ReactNode } from "react";
import { BaseSectionProps } from "./common";
import { FAQItem } from "../molecules/faqContainer";

export interface FaqProps {
  className?: string;
  children?: ReactNode;
}

export interface FAQProps extends BaseSectionProps {}

export interface FAQContent {
  title: string;
  specialWord: string;
  description: string;
  faqs: FAQItem[];
}
