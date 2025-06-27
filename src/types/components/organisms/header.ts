import { NavigationItem } from "../../navigation";

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
