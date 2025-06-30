import { ReactNode } from "react";

export interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  avatar?: string;
  avatarAlt?: string;
  rating: number;
  className?: string;
}
