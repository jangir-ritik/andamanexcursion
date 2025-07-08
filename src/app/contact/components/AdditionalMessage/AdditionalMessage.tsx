import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../../page";
// import { TagInput } from "@/components/atoms";
// import { Textarea } from "@/components/atoms";
import styles from "./AdditionalMessage.module.css";

interface AdditionalMessageProps {
  form: UseFormReturn<ContactFormData>;
}

export const AdditionalMessage: React.FC<AdditionalMessageProps> = ({
  form,
}) => {
  const { control, watch, setValue } = form;
  const tags = watch("additional.tags");

  const defaultTags = [
    "Need a 3N/4D Package",
    "Changed Dates",
    "Free Breakfast and High Tea",
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Any Additional Message?</h2>

      <div className={styles.content}>
        {/* <TagInput
          tags={tags}
          defaultTags={defaultTags}
          onChange={(newTags) => setValue("additional.tags", newTags)}
        />

        <Textarea
          name="additional.message"
          control={control}
          placeholder="Your Message..."
          rows={4}
        /> */}
      </div>
    </section>
  );
};
