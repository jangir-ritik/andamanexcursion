import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

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
