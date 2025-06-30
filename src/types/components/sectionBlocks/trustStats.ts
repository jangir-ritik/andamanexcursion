import { ReactNode } from "react";
import { BaseSectionProps } from "./common";

export interface TrustStatsProps extends BaseSectionProps {}

export interface StatItem {
  value: string;
  label: string;
}

export interface TrustStatsContent {
  title: string;
  specialWord: string;
  description: string;
  stats: StatItem[];
}
