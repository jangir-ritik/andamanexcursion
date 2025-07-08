export interface StoryProps {
  content: StoryContent;
}

export interface StoryContent {
  title: string;
  specialWord: string;
  description: string;
  image: string;
  imageAlt: string;
}
