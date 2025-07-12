"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import styles from "./PageBackgroundProvider.module.css";

export function PageBackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Generate CSS class based on pathname
  const getPageClass = (path: string) => {
    switch (path) {
      case "/":
        return "page-home";
      case "/about":
        return "page-about";
      case "/packages":
        return "page-packages";
      case "/contact":
        return "page-contact";
      case "/plan-your-trip":
        return "page-plan-your-trip";
      default:
        return "page-default";
    }
  };

  return (
    <main
      className={cn(styles.pageBackground, styles[`${getPageClass(pathname)}`])}
    >
      {children}
    </main>
  );
}
