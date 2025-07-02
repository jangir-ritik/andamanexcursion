export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  unique?: boolean;
  isClickable?: boolean; // Indicates if the parent item should be clickable even with children
}

export interface BaseNavProps {
  items: NavigationItem[];
  className?: string;
}

export type MobileNavProps = BaseNavProps;
