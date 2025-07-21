// import React from "react";
// import { FAQ, LargeCardSection } from "@/components/sectionBlocks/common";
// import { Column, Row } from "@/components/layout";
// import { Section } from "@/components/layout";
// import {
//   Button,
//   DecorativeCurlyArrow,
//   DescriptionText,
//   ImageContainer,
//   SectionTitle,
// } from "@/components/atoms";
// import { ExperienceSection } from "./components/ExperienceSection";

// import styles from "./page.module.css";
// import { content } from "./page.content";

// export default async function SpecialsPage() {
//   return (
//     <main className={styles.main}>
//       <Section className={styles.section}>
//         <Row
//           fullWidth
//           gap="var(--space-8)"
//           className={styles.contentContainer}
//           alignItems="start"
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <Column fullWidth className={styles.titleContainer}>
//             <h1 className={styles.highlight}>
//               {content.title.text} <br />
//               <span className={styles.title}>{content.title.specialWord}</span>
//             </h1>
//           </Column>
//         </Row>
//         <Row
//           gap="var(--space-8)"
//           fullWidth
//           responsive
//           alignItems="start"
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <ImageContainer
//             src={content.banner.image}
//             alt={content.banner.imageAlt}
//             aspectRatio="banner"
//             priority
//             fullWidth
//           />
//         </Row>
//       </Section>

//       <Section fullBleed className={styles.waveContainer}>
//         <Row
//           fullWidth
//           gap="var(--space-6)"
//           justifyContent="between"
//           alignItems="start"
//           className={styles.contentContainer}
//           responsive
//           responsiveGap="var(--space-4)"
//           responsiveAlignItems="start"
//         >
//           <SectionTitle
//             className={styles.featureTitle}
//             text={content.feature.title}
//             specialWord={content.feature.specialWord}
//           />
//           <DecorativeCurlyArrow
//             top="50%"
//             left="20%"
//             flip
//             rotation={210}
//             scale={1.5}
//           />
//           <Column fullWidth className={styles.imageContainer}>
//             <ImageContainer
//               src={content.feature.image}
//               alt={content.feature.imageAlt}
//               aspectRatio="square"
//               priority
//               fullWidth
//               className={styles.image}
//             />
//           </Column>
//           <Column
//             gap={3}
//             alignItems="start"
//             responsive
//             responsiveGap="var(--space-4)"
//             responsiveAlignItems="start"
//           >
//             <DescriptionText
//               text={content.feature.description}
//               className={styles.description}
//             />
//             <Button showArrow href={content.feature.ctaHref}>
//               {content.feature.ctaText}
//             </Button>
//           </Column>
//         </Row>
//       </Section>

//       <ExperienceSection content={content.experience} />

//       <FAQ content={content.faq} />

//       <LargeCardSection content={content.largeCardSection} />
//     </main>
//   );
// }

import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { getPageBySlug } from "@/lib/payload";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function SpecialsPage({ params }: PageProps) {
  // Use 'home' as default slug for the homepage
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "specials";

  const page = await getPageBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}
