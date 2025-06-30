import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface TestimonialsProps extends BaseSectionProps {}

export interface TestimonialItem {
  quote: string;
  author: string;
  location: string;
  avatar?: {
    src: string;
  };
  avatarAlt?: string;
  rating: number;
}

export interface TestimonialsContent {
  title: string;
  specialWord: string;
  description: string;
  testimonials: TestimonialItem[];
}
