import React from "react";
import { Star } from "lucide-react";
import styles from "./StarIcon.module.css";
import { cn } from "@/utils/cn";
import { StarIconProps } from "@/types/components/atoms/icons";

export const StarIcon: React.FC<StarIconProps> = ({ className }) => {
  return <Star className={cn(styles.icon, className)} aria-hidden="true" />;
};
