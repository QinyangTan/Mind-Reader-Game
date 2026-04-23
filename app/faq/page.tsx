import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Mind Reader and The Psychic Chamber.",
};

export default function FaqPage() {
  return (
    <SiteInfoPage
      eyebrow="FAQ"
      title="Questions visitors usually ask before stepping deeper into the chamber."
      description="A quick overview of how the game works, how the two rituals differ, and what visitors should expect from the public web release."
      sections={[
        {
          title: "How do the two modes differ?",
          body: [
            "In Read My Mind, Mora asks the questions and tries to uncover your hidden thought. In Guess My Mind, Mora guards a secret and you navigate a structured inquiry flow to discover it.",
            "Both rituals use the same broader chamber world, but they emphasize different forms of strategy and pacing.",
          ],
        },
        {
          title: "Does the game learn over time?",
          body: [
            "Yes. Mind Reader keeps separate learned data so taught corrections and repeated completed rounds can improve future inference without mutating the seeded catalog.",
            "That learning is designed to stay compatible with the game's fairness rules and local-first behavior.",
          ],
        },
      ]}
    />
  );
}
