"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContactForm } from "./components/ContactForm/ContactForm";
import { useFormPersistence } from "./hooks/useFormPersistence";
import styles from "./page.module.css";
import { contactFormSchema } from "./page.schema";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";

export type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      booking: {
        package: "",
        duration: "",
        checkIn: new Date(),
        checkOut: new Date(),
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
