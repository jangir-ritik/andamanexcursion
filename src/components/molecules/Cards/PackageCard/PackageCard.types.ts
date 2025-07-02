export interface PackageCardProps {
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  href?: string;
  className?: string;
}
