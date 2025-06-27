import React from "react";
import clsx from "clsx";
import Image from "next/image";
import logo from "@icons/logo.svg";
import { navItems } from "./Header.content";
import { DesktopNav } from "@/components/molecules/DesktopNav/DesktopNav";
import { MobileNav } from "@/components/molecules/MobileNav/MobileNav";
import styles from "./Header.module.css";
import Link from "next/link";

export interface HeaderProps {
  className?: string;
}

export const Header = React.memo(({ className, ...props }: HeaderProps) => {
  return (
    <header className={clsx(styles.root, className)} {...props}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src={logo}
              alt="Andaman Excursion"
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>

        <DesktopNav items={navItems} className={styles.desktopNav} />

        <MobileNav items={navItems} className={styles.mobileNav} />
      </div>
    </header>
  );
});

Header.displayName = "Header";
