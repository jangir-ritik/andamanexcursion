"use client";

import React, { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import styles from "./FAQContainer.module.css";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQContainerProps {
  items: FAQItem[];
  className?: string;
}

function FAQContainer({ items, className = "" }: FAQContainerProps) {
  const [openItem, setOpenItem] = useState<string>("item-0");

  const handleValueChange = (value: string) => {
    setOpenItem(value);
  };

  return (
    <div className={`${styles.faqContainer} ${className}`}>
      <Accordion.Root
        className={styles.accordionRoot}
        type="single"
        defaultValue="item-0"
        collapsible
        onValueChange={handleValueChange}
        value={openItem}
      >
        {items.map((item, index) => (
          <Accordion.Item
            key={`item-${index}`}
            value={`item-${index}`}
            className={styles.accordionItem}
          >
            <Accordion.Header className={styles.accordionHeader}>
              <Accordion.Trigger className={styles.accordionTrigger}>
                <span className={styles.questionText}>{item.question}</span>
                <div className={styles.iconWrapper}>
                  {openItem === `item-${index}` ? (
                    <Minus size={24} />
                  ) : (
                    <Plus size={24} />
                  )}
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.accordionContent}>
              <div className={styles.accordionContentText}>{item.answer}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

export default FAQContainer;
