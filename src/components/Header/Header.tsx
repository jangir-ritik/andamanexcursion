import React from "react";
import Image from "next/image";
import { DesktopNav } from "../molecules/DesktopNav/DesktopNav";
import { MobileNav } from "../molecules/MobileNav/MobileNav";
import styles from "./Header.module.css";

import { HeaderProps } from "@/types/components/organisms/header";
import { HEADER_CONTENT } from "./Header.content";

export const Header = ({ className }: HeaderProps) => {
  return (
    <header className={`${styles.header} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image
            src={HEADER_CONTENT.logo.src}
            alt={HEADER_CONTENT.logo.alt}
            width={150}
            height={50}
            priority
          />
        </div>
        <div className={styles.navigation}>
          <DesktopNav items={HEADER_CONTENT.navigation} />
          <MobileNav items={HEADER_CONTENT.navigation} />
        </div>
      </div>
    </header>
  );
};
