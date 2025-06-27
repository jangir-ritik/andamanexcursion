import React from "react";
import styles from "./Button.module.css";
import { ButtonProps } from "@/types/components/atoms/button";
import { MoveRight } from "lucide-react";

export const Button = ({
  children,
  onClick,
  className,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  showArrow = false,
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

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {showArrow && (
        <span className={styles.icon}>
          <MoveRight size={16} />
        </span>
      )}
    </button>
  );
};
