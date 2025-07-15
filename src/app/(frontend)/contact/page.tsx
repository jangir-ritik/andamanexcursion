"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactForm } from "./components/ContactForm/ContactForm";
import { useFormPersistence } from "./hooks/useFormPersistence";
import styles from "./page.module.css";
import {
  contactFormSchema,
  ContactFormData,
} from "./components/ContactForm/ContactForm.types";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      booking: {
        package: "beach-front-romance-port-blair",
        duration: "4-nights-5-days",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        adults: 2,
        children: 0,
      },
      personal: {
        fullName: "",
        age: 25,
        phone: "",
        email: "",
      },
      additional: {
        tags: [],
        message: "",
      },
      additionalMessage: "",
    },
  });

  const { clearSavedData } = useFormPersistence(form);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      setSubmitSuccess(true);
      clearSavedData();
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <Container className={styles.container}>
        <SectionTitle
          specialWord="Love to Hear"
          text="We'd Love to Hear from you!"
          className={styles.title}
        />
        <ContactForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitSuccess={submitSuccess}
        />
      </Container>
    </div>
  );
}
