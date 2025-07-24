// import React from "react";
// import { Section, Column, Grid } from "@/components/layout";

// import {
//   FAQ,
//   LargeCardSection,
//   Testimonials,
// } from "@/components/sectionBlocks/common";
// import {
//   DescriptionText,
//   ImageContainer,
//   SectionTitle,
// } from "@/components/atoms";
// import { BookingForm } from "@/components/organisms";
// import { SmallCard } from "@/components/molecules/Cards";

// import styles from "./page.module.css";

// import { content } from "./page.content";

// export default function ActivitiesPage() {
//   return (
//     <main className={styles.main}>
//       <Section noPadding id="hero">
//         <Column gap="var(--space-8)" fullWidth>
//           <ImageContainer
//             src={content.image}
//             alt={content.imageAlt}
//             aspectRatio="banner"
//             priority
//             fullWidth
//           />

//           <BookingForm initialTab="activities" />
//         </Column>
//       </Section>
//       <Section id="activities" noPadding>
//         <Column
//           gap={3}
//           alignItems="start"
//           justifyContent="start"
//           fullWidth
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <SectionTitle
//             text={content.title}
//             specialWord={content.subtitle}
//             id="activities-title"
//           />
//           <DescriptionText text={content.description} />
//           <Grid
//             columns={{ desktop: 3, tablet: 2, mobile: 1 }}
//             gap={3}
//             role="grid"
//             ariaLabel="Available water activities"
//           >
//             {content.activitiesData.map((activity) => (
//               <SmallCard
//                 key={activity.id}
//                 image={activity.image.src}
//                 imageAlt={activity.imageAlt}
//                 title={activity.name}
//                 description={activity.description}
//                 href={activity.href}
//               />
//             ))}
//           </Grid>
//         </Column>
//       </Section>
//       <FAQ content={content.faqSection} />
//       <Testimonials content={content.testimonials} />
//       <LargeCardSection content={content.largeCardSection} />
//     </main>
//   );
// }

import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";

const ActivitiesPage = async () => {
  const page = await pageService.getBySlug("activities");

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
};

export default ActivitiesPage;
