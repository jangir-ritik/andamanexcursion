import React from "react";
import Link from "next/link";
import { CustomLinkProps } from "@/types/components/atoms/customLink";

export const CustomLink = ({
  href,
  children,
  className,
  external = false,
}: CustomLinkProps) => {
  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
