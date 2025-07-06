export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface SmallCardProps extends BaseCardProps {
  description?: string;
  duration?: string;
  price?: string | number;
  href?: string;
  rating?: number;
}
