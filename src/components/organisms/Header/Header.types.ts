export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  unique?: boolean;
  isClickable?: boolean; // Indicates if the parent item should be clickable even with children
}

export interface HeaderProps {
  className?: string;
}

export interface HeaderContent {
  logo: {
    src: string;
    alt: string;
  };
  navigation: NavigationItem[];
}
