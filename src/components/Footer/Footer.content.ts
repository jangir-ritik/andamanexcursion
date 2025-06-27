import { FooterContent } from "@/types/components/organisms/footer";

export const FOOTER_CONTENT: FooterContent = {
  logo: {
    src: "/icons/logo_white.svg",
    alt: "Andaman Excursion Logo",
  },
  sections: [
    {
      title: "Services",
      links: [
        { label: "Ferry Booking", href: "/ferry" },
        { label: "Activities", href: "/activities" },
        { label: "Packages", href: "/packages" },
        { label: "Custom Tours", href: "/custom-tours" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Safety", href: "/safety" },
        { label: "Cancellation", href: "/cancellation" },
        { label: "COVID-19", href: "/covid" },
      ],
    },
  ],
  copyright: "© 2023 Andaman Excursion. All rights reserved.",
  socialLinks: [
    {
      platform: "Instagram",
      href: "https://instagram.com",
      icon: "/icons/instagram.svg",
    },
    {
      platform: "LinkedIn",
      href: "https://linkedin.com",
      icon: "/icons/linkedin.svg",
    },
    {
      platform: "YouTube",
      href: "https://youtube.com",
      icon: "/icons/youtube.svg",
    },
    {
      platform: "Threads",
      href: "https://threads.net",
      icon: "/icons/threads.svg",
    },
  ],
};
