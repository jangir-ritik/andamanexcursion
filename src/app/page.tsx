
import styles from "./page.module.css";
import { BookingForm } from "@/components/BookingForm";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* <h1 className={styles.title}>Andaman Excursion</h1> */}
      <BookingForm />
    </div>
  );
}
