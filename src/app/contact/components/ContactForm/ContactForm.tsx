import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "../../page";
import { BookingDetails } from "../BookingDetails/BookingDetails";
import { PersonalDetails } from "../PersonalDetails/PersonalDetails";
import { AdditionalMessage } from "../AdditionalMessage/AdditionalMessage";

import styles from "./ContactForm.module.css";
import { Button } from "@/components/atoms";

interface ContactFormProps {
  form: UseFormReturn<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  submitSuccess,
}) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.sections}>
        <BookingDetails form={form} />
        <div className={styles.separator} />
        <PersonalDetails form={form} />
        <div className={styles.separator} />
        <AdditionalMessage form={form} />
      </div>

      <div className={styles.submitSection}>
        <div className={styles.recaptcha}>
          {/* reCAPTCHA would go here */}
          <div className={styles.recaptchaPlaceholder}>I'm not a robot ✓</div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className={styles.submitButton}
          showArrow
        >
          {isSubmitting ? "Submitting..." : "Enquire"}
        </Button>
      </div>

      {submitSuccess && (
        <div className={styles.successMessage}>
          Thank you! Your enquiry has been submitted successfully.
        </div>
      )}
    </form>
  );
};
