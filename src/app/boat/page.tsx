"use client";

import React from "react";
import { BookingForm } from "@/components/organisms/BookingForm/BookingForm";
import styles from "./page.module.css";

export default function BoatPage() {
  return (
    <main className={styles.main}>
      <BookingForm initialTab="local-boat" />
      <div className={styles.content}>
        <h1>Local Boat Booking</h1>
        <p>This page is under development.</p>
      </div>
    </main>
  );
}
