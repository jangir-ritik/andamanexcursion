"use client";

import React from "react";
import styles from "./page.module.css";
import { UnifiedSearchingForm } from "@/components/organisms";

export default function BoatPage() {
  return (
    <main className={styles.main}>
      <UnifiedSearchingForm className={styles.bookingForm} initialTab="local-boat" />
      <div className={styles.content}>
        <h1>Local Boat Booking</h1>
        <p>This page is under development.</p>
      </div>
    </main>
  );
}
