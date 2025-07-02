"use client";

import React from "react";
import { Section } from "@/components/layout/Section";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { getPackageById } from "@/data/packages";
import { useParams } from "next/navigation";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
import { PackageDetailTabs } from "@/components/organisms/PackageDetailTabs";
import { FAQ } from "@/components/sectionBlocks/common/faq";

import styles from "../../page.module.css";
import Testimonials from "@/components/sectionBlocks/common/testimonials";
import ScubaDiving from "@/components/sectionBlocks/common/scubaDiving";
import { InlineLink } from "@/components/atoms/InlineLink";
import { Row } from "@/components/layout/Row";
import { Button } from "@/components/atoms/Button/Button";

const PackageDetailPage = () => {
  const params = useParams();
  const packageId = params.id as string;

  const packageData = getPackageById(packageId);

  if (!packageData) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap={3}>
            <SectionTitle text="Package Not Found" />
            <DescriptionText text="The package you're looking for does not exist." />
          </Column>
        </Section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Section className={styles.packageDetailSection}>
        <Column fullWidth gap={5}>
          <PackageDetailHeader packageData={packageData} />
          {/* Package Detail Tabs */}
          <PackageDetailTabs packageData={packageData} />
          <Row gap={3}>
            <InlineLink href="/customise">Customise this package</InlineLink>
            <Button>Enquire</Button>
          </Row>
        </Column>
      </Section>
      <FAQ
        title="Frequently Asked Questions"
        items={[
          {
            question: "What is the price of the package?",
            answer: "The price of the package is 10000 INR per person.",
          },
        ]}
      />
      <Testimonials />
      <ScubaDiving />
    </main>
  );
};

export default PackageDetailPage;
