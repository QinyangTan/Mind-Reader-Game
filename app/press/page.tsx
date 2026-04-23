import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "Press",
  description: "Press overview and summary for Mind Reader and The Psychic Chamber.",
};

export default function PressPage() {
  return (
    <SiteInfoPage
      eyebrow="Press"
      title="Mind Reader is a chamber-led browser game built for a public audience."
      description="This page provides a concise public-facing summary of the project for media, showcases, and outside references."
      sections={[
        {
          title: "Short description",
          body: [
            "Mind Reader is a cinematic browser game where visitors enter Mora's psychic chamber and play two mirrored rituals: one where Mora reads their mind, and one where they try to read hers.",
            "It combines layered inference, local-first learning, public-rank-ready scoring, and a world-first visual presentation rather than a standard app dashboard.",
          ],
        },
        {
          title: "Coverage angle",
          body: [
            "The project is best described as a browser game that treats scene composition, pacing, and readable interaction as part of the product identity rather than as decoration around a guessing engine.",
            "For interviews or feature requests, use the Contact page so press follow-up goes through a real maintained channel.",
          ],
        },
      ]}
    />
  );
}
