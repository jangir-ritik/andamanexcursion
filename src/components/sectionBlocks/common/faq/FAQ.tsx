"use client";

import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";

import styles from "./FAQ.module.css";
import FAQContainer from "@/components/molecules/FAQContainer";
import { FAQProps } from "./FAQ.types";

export interface FAQItem {
  question: string;
  answer: string;
}

function FAQ({ title, specialWord, items, className }: FAQProps) {
  return (
    <Section id="faq" aria-labelledby="faq-title" className={className}>
      <Row wrap fullWidth justifyContent="between">
        <Column className={styles.titleColumn}>
          <SectionTitle text={title} specialWord={specialWord} id="faq-title" />
          <div className={styles.decorativeElement} aria-hidden="true">
            {/* Decorative elements will be handled by CSS */}
          </div>
        </Column>
        <Column className={styles.contentColumn} fullWidth>
          <FAQContainer items={items} />
        </Column>
      </Row>
    </Section>
  );
}

export default FAQ;
