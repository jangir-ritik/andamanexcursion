import { DescriptionText, SectionTitle } from "@/components/atoms";

import React from "react";
import styles from "./PlanInFourEasySteps.module.css";
import { Column, Row, Section } from "@/components/layout";
import { Step } from "@/components/atoms";
import Image from "next/image";
import stepsWave from "@public/graphics/stepsWave.svg";
import { PlanInFourEasyStepsContent } from "./PlanInFourEasySteps.types";

export const PlanInFourEasySteps = ({
  content,
}: {
  content: PlanInFourEasyStepsContent;
}) => {
  return (
    <Section
      className={styles.planInFourEasyStepsSection}
      id="plan-in-four-easy-steps"
      aria-labelledby="plan-in-four-easy-steps-title"
      fullBleed
    >
      <Image
        src={stepsWave}
        alt="steps wave"
        fill
        className={styles.stepsWave}
      />
      <Column
        fullWidth
        gap="var(--space-10)"
        className={styles.contentContainer}
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <Row
          fullWidth
          justifyContent="between"
          className={styles.titleContainer}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            specialWord={content.specialWord}
            text={content.title}
            id="plan-in-four-easy-steps-title"
          />
          <DescriptionText
            text={content.description}
            align="right"
            className={styles.description}
          />
        </Row>
        <Row fullWidth className={styles.stepsContainer}>
          <div className={styles.stepsWrapper}>
            <div className={styles.steps}>
              {content.steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  position={index % 2 === 0 ? "top" : "bottom"}
                />
              ))}
            </div>
          </div>
        </Row>
      </Column>
    </Section>
  );
};


// "blockType": "planInFourEasySteps",
// "title": "Plan your Ride in 4 Easy Steps!",
// "specialWord": "4 Easy Steps!",
// "description": "From island-hopping to water adventures, book smooth ferry rides tailored to your travel plan.",
// "steps": [

// {

//     "title": "Select your route",
//     "description": "Select your islands and travel date to get started.",

// "icon": {

//     "createdAt": "2025-08-04T09:18:39.079Z",
//     "updatedAt": "2025-08-04T09:18:39.079Z",
//     "alt": "GPS alt",
//     "caption": "GPS caption",
//     "filename": "location.svg",
//     "mimeType": "image/svg+xml",
//     "filesize": 704,
//     "width": 34,
//     "height": 35,

// "sizes": {

// "thumbnail": {

//     "url": null

// },
// "smallCard": {

//     "url": null

// },
// "card": {

//     "url": null

// },
// "tablet": {

//     "url": null

// },

//             "desktop": {
//                 "url": null
//             }
//         },
//         "id": "68907aef9fb0ab464a3fd191",
//         "url": "/api/media/file/location.svg",
//         "thumbnailURL": null
//     },
//     "id": "68907ccb8e6fa481ca6a4309"

// },