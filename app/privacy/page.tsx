import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Mind Reader and The Psychic Chamber.",
};

export default function PrivacyPage() {
  return (
    <SiteInfoPage
      eyebrow="Privacy Policy"
      title="Mind Reader is designed to stay local-first where possible."
      description="The chamber stores gameplay progress and preferences locally by default, and any public-facing profile or ranking behavior is intended to remain lightweight and clearly scoped."
      sections={[
        {
          title: "Local data",
          body: [
            "The game stores settings, progress, personal history, learned entities, and related play information locally in your browser so the ritual can persist between sessions.",
            "This local-first behavior is central to the current product design and helps keep the experience usable even without a full backend account system.",
          ],
        },
        {
          title: "Public-facing data",
          body: [
            "If leaderboard or profile services are enabled for a published deployment, the site may store a lightweight public display name, scoring totals, and gameplay summary metrics needed to support rankings.",
            "Example ads in the current build are static creatives and do not rely on heavy third-party ad network scripts. External links, such as social profiles, are opened directly and safely in a new tab.",
          ],
        },
      ]}
    />
  );
}
