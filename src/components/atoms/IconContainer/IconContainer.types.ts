export interface IconContainerProps {
  src: string | { url: string } | null | undefined;
  alt: string;
  size?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}
