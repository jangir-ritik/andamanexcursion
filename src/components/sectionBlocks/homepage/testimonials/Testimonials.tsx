import React from "react";
import Image from "next/image";
import { TestimonialCard } from "@/components/molecules";
import { Section, Container, Column } from "@/components/layout";
import { testimonialsContent } from "./Testimonials.content";
import styles from "./Testimonials.module.css";
import googleIcon from "@public/icons/socials/google.svg";
import { SectionTitle } from "@/components/atoms/SectionTitle";

const Testimonials = () => {
  const { title, subtitle, testimonials, specialWord } = testimonialsContent;

  // Create a duplicate set of testimonials for the infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <Section className={styles.testimonialsSection} fullBleed>
      <Column gap={6} fullWidth className={styles.testimonialsContainer}>
        <Container className={styles.testimonialsHeaderContainer}>
          <Column gap={2}>
            <SectionTitle text={title} specialWord={specialWord} />
            <div className={styles.googleInfo}>
              <div className={styles.googleIcon}>
                <Image src={googleIcon} alt="Google" width={20} height={20} />
              </div>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </Column>
        </Container>

        <div className={styles.carouselContainer}>
          <div className={styles.carousel}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                text={testimonial.text}
                author={testimonial.author}
                avatar={testimonial.avatar}
                rotation={testimonial.rotation}
              />
            ))}
          </div>
        </div>
      </Column>
    </Section>
  );
};

export default Testimonials;
