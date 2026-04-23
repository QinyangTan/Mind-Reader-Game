export interface SiteFooterNavLink {
  label: string;
  href: string;
}

export interface SiteSocialLink {
  label: "LinkedIn" | "GitHub" | "Handshake";
  href: string;
}

export const siteFooterNavLinks: readonly SiteFooterNavLink[] = [
  { label: "Home", href: "/" },
  { label: "Contact us", href: "/contact" },
  { label: "Legal", href: "/legal" },
  { label: "Terms", href: "/terms" },
  { label: "About us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "FAQ", href: "/faq" },
  { label: "Press", href: "/press" },
];

export const siteSocialLinks: readonly SiteSocialLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/qinyang-tan-32a858318/",
  },
  {
    label: "GitHub",
    href: "https://github.com/QinyangTan",
  },
  {
    label: "Handshake",
    href: "https://app.joinhandshake.com/profiles/r395rd",
  },
];
