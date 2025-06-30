import React from "react";
import styles from "./Button.module.css";
import { ButtonProps } from "@/types/components/atoms/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export const Button = ({
  children,
  onClick,
  className,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  showArrow = false,
  href,
  target = "_self",
  ariaLabel,
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[variant] || styles.primary,
    styles[size] || styles.medium,
    disabled ? styles.disabled : "",
    className || "",
  ]
    .join(" ")
    .trim();

  const content = (
    <>
      {children}
      {showArrow && (
        <span className={styles.icon}>
          <MoveRight size={16} aria-hidden="true" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
