export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface SmallCardProps extends BaseCardProps {
  duration?: string;
  price: string;
  href?: string;
  rating?: number;
}
