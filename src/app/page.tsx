import styles from "./page.module.css";
import { BookingForm } from "@/components/organisms/BookingForm";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* <h1 className={styles.title}>Andaman Excursion</h1> */}
      <BookingForm />
    </div>
  );
}
