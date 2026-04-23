import { describe, expect, it } from "vitest";

import { siteFooterNavLinks, siteSocialLinks } from "@/lib/site/footer-links";

describe("site footer link map", () => {
  it("ships the expected internal destinations without duplicates", () => {
    expect(siteFooterNavLinks.map((link) => link.href)).toEqual([
      "/",
      "/contact",
      "/legal",
      "/terms",
      "/about",
      "/privacy",
      "/faq",
      "/press",
    ]);

    expect(new Set(siteFooterNavLinks.map((link) => link.href)).size).toBe(siteFooterNavLinks.length);
  });

  it("uses the requested public social profiles", () => {
    expect(siteSocialLinks).toEqual([
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
    ]);
  });
});
