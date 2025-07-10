import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "./ContactForm.types";
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
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <div className={styles.sections}>
        <BookingDetails form={form} />
        <div className={styles.separator} />
        <PersonalDetails form={form} />
        <div className={styles.separator} />
        <AdditionalMessage form={form} />
      </div>

      <div className={styles.submitSection}>
        <div className={styles.recaptcha}>
          <div className={styles.recaptchaPlaceholder}>
            <div className={styles.recaptchaCheckbox}></div>
            <span className={styles.recaptchaText}>I'm not a robot</span>
          </div>
          <div className={styles.recaptchaLogo}></div>
        </div>

        <Button showArrow disabled={isSubmitting} type="submit">
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
