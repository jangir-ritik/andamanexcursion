import React from "react";
import Image from "next/image";
import { TestimonialCard } from "@/components/molecules";
import { Section, Container, Column } from "@/components/layout";
import { testimonialsContent } from "./Testimonials.content";
import styles from "./Testimonials.module.css";
import googleIcon from "@public/icons/socials/google.svg";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { TestimonialsProps } from "./Testimonials.types";

const Testimonials = ({
  className,
  id = "testimonials",
}: TestimonialsProps = {}) => {
  const { title, subtitle, testimonials, specialWord } = testimonialsContent;

  // Create a duplicate set of testimonials for the infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <Section
      className={`${styles.testimonialsSection} ${className || ""}`}
      fullBleed
      id={id}
      aria-labelledby="testimonials-title"
    >
      <Column gap={6} fullWidth className={styles.testimonialsContainer}>
        <Container className={styles.testimonialsHeaderContainer}>
          <Column gap={2}>
            <SectionTitle
              text={title}
              specialWord={specialWord}
              id="testimonials-title"
            />
            <div className={styles.googleInfo}>
              <div className={styles.googleIcon}>
                <Image src={googleIcon} alt="Google" width={20} height={20} />
              </div>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </Column>
        </Container>

        <div
          className={styles.carouselContainer}
          aria-label="Customer testimonials carousel"
        >
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
