import { Media } from "@payload-types";

export interface StoryProps {
  content: StoryContent;
}

export interface StoryContent {
  title: string;
  specialWord: string;
  description: string;
  video: Media;
  alt: string;
}
