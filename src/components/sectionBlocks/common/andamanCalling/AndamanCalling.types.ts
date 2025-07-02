import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface AndamanCallingProps extends BaseSectionProps {
  className?: string;
  children?: ReactNode;
}

export interface AndamanCallingContent {
  title: string;
  specialWord: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
} 