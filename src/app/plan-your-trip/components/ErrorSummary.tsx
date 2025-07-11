import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "./ErrorSummary.module.css";

interface ErrorSummaryProps {
  errors: string[];
  title?: string;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title = "Please fix the following errors:",
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={styles.errorSummary}>
      <div className={styles.errorHeader}>
        <AlertCircle size={18} />
        <h4>{title}</h4>
      </div>
      <ul className={styles.errorList}>
        {errors.map((error, index) => (
          <li key={index} className={styles.errorItem}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};
