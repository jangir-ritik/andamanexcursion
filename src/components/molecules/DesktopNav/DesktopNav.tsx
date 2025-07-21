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
import type { DesktopNavProps } from "./DesktopNav.types";
import styles from "./DesktopNav.module.css";
import { CustomLink } from "@/components/atoms";

export const DesktopNav = React.memo(
  ({ items, className }: DesktopNavProps) => {
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
                  {item.isClickable ? (
                    // For clickable parent items with dropdowns
                    <NavigationMenuTrigger
                      className={styles.navigationMenuTriggerClickable}
                      asChild
                    >
                      <div className={styles.clickableParentContainer}>
                        <CustomLink
                          href={item.href}
                          className={clsx(
                            styles.navigationMenuLink,
                            styles.parentLink,
                            pathname === item.href && styles.active
                          )}
                          onClick={(e) => {
                            // Allow the link to work normally
                            e.stopPropagation();
                          }}
                        >
                          {item.label}
                        </CustomLink>
                        <ChevronDown
                          size={16}
                          className={styles.navigationMenuTriggerIcon}
                          aria-hidden="true"
                        />
                      </div>
                    </NavigationMenuTrigger>
                  ) : (
                    // For non-clickable parent items
                    <NavigationMenuTrigger
                      className={styles.navigationMenuTrigger}
                    >
                      <span className={styles.triggerLabel}>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={styles.navigationMenuTriggerIcon}
                        aria-hidden="true"
                      />
                    </NavigationMenuTrigger>
                  )}
                  <NavigationMenuContent
                    className={styles.navigationMenuContent}
                  >
                    <div
                      className={clsx(
                        styles.navigationMenuDropdown,
                        item.children.length > 6 &&
                          styles.navigationMenuDropdownGrid
                      )}
                    >
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
  }
);

DesktopNav.displayName = "DesktopNav";
