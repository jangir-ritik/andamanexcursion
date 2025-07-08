export interface PackagesProps {
  content: PackagesContent;
}

export interface PackagesContent {
  title: string;
  description: string;
  packages: Package[];
}

export interface Package {
  image: string;
  imageAlt: string;
  title: string;
  duration: string;
  price: string;
  href: string;
}
