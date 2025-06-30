import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface StoryProps extends BaseSectionProps {}

export interface StoryContent {
  title: string;
  specialWord: string;
  description: string;
  image: {
    src: string;
  };
  imageAlt: string;
}
