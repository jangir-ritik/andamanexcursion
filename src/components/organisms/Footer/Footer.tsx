import React, { memo } from "react";
import styles from "./Footer.module.css";
import Image from "next/image";
import logo from "@icons/logo_white.svg";
import wavePlusBoat from "@graphics/wavePlusBoat.svg";
import { footerItems } from "./Footer.content";
import Instagram from "@icons/socials/instagram.svg";
import Threads from "@icons/socials/threads.svg";
import Youtube from "@icons/socials/youtube.svg";
import Linkedin from "@icons/socials/linkedin.svg";
import Link from "next/link";
import type { FooterProps  } from "./Footer.types";

// Create a mapping object outside component to avoid recreation
const socialIconMap = {
  Instagram: { src: Instagram, alt: "Instagram" },
  Threads: { src: Threads, alt: "Threads" },
  Youtube: { src: Youtube, alt: "Youtube" },
  Linkedin: { src: Linkedin, alt: "Linkedin" },
} as const;

// Memoized social link component
const SocialLink = memo(
  ({
    social,
    index,
  }: {
    social: { platform: string; href: string };
    index: number;
  }) => {
    const iconData =
      socialIconMap[social.platform as keyof typeof socialIconMap];

    if (!iconData) return null;

    return (
      <Link
        key={index}
        href={social.href}
        className={styles.socialLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={iconData.src}
          alt={iconData.alt}
          className={styles.socialIcon}
          loading="lazy"
          width={24}
          height={24}
        />
      </Link>
    );
  }
);

SocialLink.displayName = "SocialLink";

// Memoized navigation column component
const NavColumn = memo(
  ({
    title,
    links,
  }: {
    title: string;
    links: { label: string; href: string }[];
  }) => (
    <div className={styles.navColumn}>
      <h3 className={styles.navTitle}>{title}</h3>
      <div className={styles.navLinks}>
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
);

NavColumn.displayName = "NavColumn";

export const Footer = memo<FooterProps>(({ className, ...props }) => {
  return (
    <footer className={`${styles.footer} ${className || ""}`} {...props}>
      <div className={styles.waveContainer}>
        <Image
          src={wavePlusBoat}
          alt="Wave"
          className={styles.wavePlusBoat}
          priority={false}
          loading="lazy"
        />
      </div>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Main content */}
          <div className={styles.mainContent}>
            {/* Logo and Contact Info */}
            <div className={styles.contactSection}>
              <div className={styles.logoContainer}>
                <Link href="/">
                  <Image
                    src={logo}
                    alt="Andaman Excursion"
                    loading="lazy"
                    width={120}
                    height={40}
                  />
                </Link>
              </div>

              {/* Contact Info */}
              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>
                  {footerItems.contactInfo.title}
                </h3>
                <div className={styles.contactDetails}>
                  <p className={styles.address}>
                    {footerItems.contactInfo.address}
                  </p>
                  <p className={styles.contactItem}>
                    Contact : {footerItems.contactInfo.contact}
                  </p>
                  <p className={styles.contactItem}>
                    Email : {footerItems.contactInfo.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className={styles.navigationSection}>
              <NavColumn
                title={footerItems.experience.title}
                links={footerItems.experience.links}
              />
              <NavColumn
                title={footerItems.quickLinks.title}
                links={footerItems.quickLinks.links}
              />
              <NavColumn
                title={footerItems.mustRead.title}
                links={footerItems.mustRead.links}
              />
            </div>
          </div>

          {/* Bottom section */}
          <div className={styles.bottomSection}>
            {/* Copyright */}
            <div className={styles.copyright}>{footerItems.copyright}</div>

            {/* Social Media Links */}
            <div className={styles.socialLinks}>
              {footerItems.socialLinks.map((social, index) => (
                <SocialLink key={index} social={social} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
