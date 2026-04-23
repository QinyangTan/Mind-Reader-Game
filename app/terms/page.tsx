import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the Mind Reader web game.",
};

export default function TermsPage() {
  return (
    <SiteInfoPage
      eyebrow="Terms"
      title="Use the chamber fairly, respectfully, and within the published rules."
      description="These terms describe the expected public use of Mind Reader as a browser game and establish the baseline rules for access, behavior, and content on the site."
      sections={[
        {
          title: "Permitted use",
          body: [
            "You may access and play Mind Reader for normal personal entertainment use. You may also view the public informational pages, rankings, and creator links that are part of the published site.",
            "You may not attempt to disrupt the service, scrape or automate it in a harmful way, interfere with other visitors, or misuse public features such as rankings or profile naming.",
          ],
        },
        {
          title: "Availability and changes",
          body: [
            "Mind Reader may evolve over time as the chamber, entity catalog, scoring rules, and presentation continue to improve. Features may change, move, or be removed as part of normal maintenance and release work.",
            "The game is provided on an as-available basis. While care is taken to keep it stable and playable, uninterrupted availability cannot be guaranteed.",
          ],
        },
      ]}
    />
  );
}
