"use client";
import {
  NavigationMenuLink,
  NavigationMenuLinkProps,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CustomLinkProps extends Omit<NavigationMenuLinkProps, "href"> {
  href: string;
}

const CustomLink = ({ children, href, ...props }: CustomLinkProps) => {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <NavigationMenuLink asChild active={isActive} {...props}>
      <Link href={href}>{children}</Link>
    </NavigationMenuLink>
  );
};

export default CustomLink;
