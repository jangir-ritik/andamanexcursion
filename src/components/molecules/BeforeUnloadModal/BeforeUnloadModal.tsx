"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./BeforeUnloadModal.module.css";

interface BeforeUnloadModalProps {
  isVisible: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
}

export const BeforeUnloadModal: React.FC<BeforeUnloadModalProps> = ({
  isVisible,
  onStay,
  onLeave,
  title = "Are you sure you want to leave?",
  message = "Your booking confirmation details will be lost if you leave this page. Make sure to save your booking ID and confirmation details.",
}) => {
  if (!isVisible) return null;

  // Only render on client side to avoid hydration issues
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={onStay}
              className={styles.stayButton}
            >
              Stay on Page
            </Button>
            <Button
              variant="primary"
              onClick={onLeave}
              className={styles.leaveButton}
            >
              Leave Page
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
