"use client";

import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import { FAQContainer } from "@/components/molecules/FAQContainer";
import styles from "./FAQ.module.css";
import { faqContent } from "./FAQ.content";

function FAQ() {
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Row wrap fullWidth justifyContent="between">
        <Column className={styles.titleColumn}>
          <SectionTitle
            text={faqContent.title}
            specialWord={faqContent.specialWord}
            id="faq-title"
          />
          <div className={styles.decorativeElement} aria-hidden="true">
            {/* Decorative elements will be handled by CSS */}
          </div>
        </Column>
        <Column className={styles.contentColumn} fullWidth>
          <FAQContainer items={faqContent.items} />
        </Column>
      </Row>
    </Section>
  );
}

export default FAQ;
