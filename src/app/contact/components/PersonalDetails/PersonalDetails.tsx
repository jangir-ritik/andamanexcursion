import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../../page";
// import { Input } from "@/components/atoms";
// import { PhoneInput } from "@/components/atoms";
import styles from "./PersonalDetails.module.css";

interface PersonalDetailsProps {
  form: UseFormReturn<ContactFormData>;
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({ form }) => {
  const { control } = form;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Details</h2>

      <div className={styles.grid}>
        <div className={styles.gridItem}>
          {/* <Input
            name="personal.fullName"
            control={control}
            placeholder="Full Name"
            required
          /> */}
        </div>

        <div className={styles.gridItem}>
          {/* <Input
            name="personal.age"
            control={control}
            type="number"
            placeholder="Age"
            min={1}
            max={120}
            required
          /> */}
        </div>

        <div className={styles.gridItem}>
          {/* <PhoneInput
            name="personal.phone"
            control={control}
            placeholder="00000 00000"
            required
          /> */}
        </div>

        <div className={styles.gridItem}>
          {/* <Input
            name="personal.email"
            control={control}
            type="email"
            placeholder="Email ID"
            required
          /> */}
        </div>
      </div>
    </section>
  );
};
