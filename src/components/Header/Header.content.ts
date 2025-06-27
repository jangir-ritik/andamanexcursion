import { HeaderContent } from "@/types/components/organisms/header";

export const HEADER_CONTENT: HeaderContent = {
  logo: {
    src: "/icons/logo.svg",
    alt: "Andaman Excursion Logo",
  },
  navigation: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Ferry",
      href: "/ferry",
    },
    {
      label: "Activities",
      href: "/activities",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
};
