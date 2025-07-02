"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import styles from "./InlineLink.module.css";
import { InlineLinkProps } from "./InlineLink.types";

export const InlineLink: React.FC<InlineLinkProps> = ({
  href,
  children,
  className = "",
  ariaLabel,
  icon = "arrow-up-right",
  iconSize = 20,
  color = "primary",
  onClick,
  target = "_self",
}) => {
  const renderIcon = () => {
    if (icon === "none") return null;

    return (
      <span className={styles.icon} aria-hidden="true">
        {icon === "arrow-up-right" && <ArrowUpRight size={iconSize} />}
        {icon === "arrow-right" && <ArrowRight size={iconSize} />}
      </span>
    );
  };

  const linkClasses = [styles.inlineLink, styles[`color-${color}`], className]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <Link
      href={href}
      className={linkClasses}
      aria-label={ariaLabel}
      onClick={onClick}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      <span className={styles.content}>{children}</span>
      {renderIcon()}
    </Link>
  );
};

export default InlineLink;
