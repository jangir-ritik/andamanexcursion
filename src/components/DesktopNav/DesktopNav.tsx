"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@radix-ui/react-navigation-menu";
import { ChevronDown, MoveRight } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import CustomLink from "@components/CustomLink/CustomLink";
import { BaseNavProps } from "@/types/navigation";
import styles from "./DesktopNav.module.css";

export const DesktopNav = React.memo(({ items, className }: BaseNavProps) => {
  const pathname = usePathname();

  return (
    <NavigationMenu className={clsx(styles.navigationMenu, className)}>
      <NavigationMenuList className={styles.navigationMenuList}>
        {items.map((item) => (
          <NavigationMenuItem
            className={styles.navigationMenuItem}
            key={item.label}
          >
            {!item.children ? (
              <CustomLink
                className={clsx(
                  styles.navigationMenuLink,
                  pathname === item.href && styles.active,
                  item.unique && styles.navigationMenuLinkUnique
                )}
                href={item.href}
              >
                {item.label}
                {item.unique && <MoveRight size={16} aria-hidden="true" />}
              </CustomLink>
            ) : (
              <div className={styles.navigationMenuItemWithDropdown}>
                <NavigationMenuTrigger className={styles.navigationMenuTrigger}>
                  {item.label}
                  <ChevronDown
                    size={16}
                    className={styles.navigationMenuTriggerIcon}
                    aria-hidden="true"
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent className={styles.navigationMenuContent}>
                  <div className={styles.navigationMenuDropdown}>
                    {item.children.map((child) => (
                      <CustomLink
                        className={clsx(
                          styles.navigationMenuLink,
                          pathname === child.href && styles.active
                        )}
                        key={child.label}
                        href={child.href}
                      >
                        {child.label}
                      </CustomLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </div>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
});

DesktopNav.displayName = "DesktopNav";
