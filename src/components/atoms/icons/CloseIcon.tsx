import React from "react";
import { X } from "lucide-react";
import styles from "./CloseIcon.module.css";
import { cn } from "@/utils/cn";
import { CloseIconProps } from "@/types/components/atoms/icons";

export const CloseIcon: React.FC<CloseIconProps> = ({ className }) => {
  return <X className={cn(styles.icon, className)} aria-hidden="true" />;
};
