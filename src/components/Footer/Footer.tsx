import React from "react";
import Image from "next/image";
import styles from "./Footer.module.css";
import { FOOTER_CONTENT } from "./Footer.content";
import { FooterProps } from "@/types/components/organisms/footer";
import { CustomLink } from "../CustomLink/CustomLink";

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Image
            src={FOOTER_CONTENT.logo.src}
            alt={FOOTER_CONTENT.logo.alt}
            width={150}
            height={50}
          />
        </div>

        <div className={styles.linksSection}>
          {FOOTER_CONTENT.sections.map((section, index) => (
            <div key={index} className={styles.linkGroup}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <ul className={styles.linkList}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <CustomLink href={link.href}>{link.label}</CustomLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.socialSection}>
          <div className={styles.socialIcons}>
            {FOOTER_CONTENT.socialLinks.map((social, index) => (
              <CustomLink
                key={index}
                href={social.href}
                className={styles.socialIcon}
                external
              >
                <Image
                  src={social.icon}
                  alt={social.platform}
                  width={24}
                  height={24}
                />
              </CustomLink>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.copyright}>{FOOTER_CONTENT.copyright}</div>
    </footer>
  );
};
