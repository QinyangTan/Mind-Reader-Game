import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "Legal",
  description: "Legal overview for Mind Reader, including links to the terms and privacy policy.",
};

export default function LegalPage() {
  return (
    <SiteInfoPage
      eyebrow="Legal"
      title="Public-site rules and policy references for Mind Reader."
      description="This page summarizes the core legal framing for the published game and points visitors to the terms and privacy policy that govern normal public use."
      sections={[
        {
          title: "Scope",
          body: [
            "Mind Reader is published as an interactive browser game with a local-first experience, optional public ranking behavior, and curated example advertising slots.",
            "Use of the site is also subject to the Terms and the Privacy Policy, which explain gameplay access, expected conduct, and how the site handles local and public-facing data.",
          ],
        },
        {
          title: "Important note",
          body: [
            "The legal materials on this site are written to support a clean public release of the project. They are informational product documents for the site itself and are not a substitute for jurisdiction-specific legal counsel.",
            "If the project later adds live backend services, monetization, or additional public integrations, these materials should be revised accordingly.",
          ],
        },
      ]}
    />
  );
}
