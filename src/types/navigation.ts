export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  unique?: boolean;
}

export interface BaseNavProps {
  items: NavigationItem[];
  className?: string;
}
