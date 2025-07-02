import React from "react";
import { Check } from "lucide-react";
import styles from "./CheckIcon.module.css";
import { cn } from "@/utils/cn";
import { CheckIconProps } from "@/types/components/atoms/icons";

export const CheckIcon: React.FC<CheckIconProps> = ({ className }) => {
  return <Check className={cn(styles.icon, className)} aria-hidden="true" />;
};
