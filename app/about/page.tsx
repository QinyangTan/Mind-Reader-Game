import type { Metadata } from "next";

import { SiteInfoPage } from "@/components/site/site-info-page";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn what Mind Reader is, how Mora's chamber works, and what the public web game is built to be.",
};

export default function AboutPage() {
  return (
    <SiteInfoPage
      eyebrow="About us"
      title="Mind Reader is a public web game built around ritual play."
      description="The Psychic Chamber turns classic guessing-game structure into a character-led browser experience with Mora as host, layered questioning, and local-first progress."
      sections={[
        {
          title: "What the game is",
          body: [
            "Mind Reader is a two-mode browser game. In one ritual, Mora studies your answers and tries to guess what you are hiding. In the other, you probe Mora's secret thought through structured clues and make the final guess yourself.",
            "The experience is designed to feel atmospheric and memorable without sacrificing scanability, fairness, or clear game rules.",
          ],
        },
        {
          title: "How it is built",
          body: [
            "The chamber runs as a local-first Next.js experience with seeded entities, learned entities, personal history, and public-rank-ready scoring. It keeps the dramatic tone of the chamber while still behaving like a real published web product.",
            "Every major release pass aims to improve question quality, readability, and long-term replayability rather than just piling on decorative UI.",
          ],
        },
      ]}
    />
  );
}
