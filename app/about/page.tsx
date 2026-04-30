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
            "The active catalog spans fictional characters, animals, objects, foods, and historical figures. Each category has its own vocabulary of traits, so the chamber can ask questions that make sense for the kind of thought being read.",
            "The experience is designed to feel atmospheric and memorable without sacrificing scanability, fairness, or clear game rules. Mora may refuse a guess when the evidence is too divided rather than making a careless false reading.",
          ],
        },
        {
          title: "How Read My Mind works",
          body: [
            "You choose a focus category, hold an answer in your head, and respond to Mora's questions with yes, no, probably, probably not, or unknown. Those answers become soft evidence, not instant eliminations.",
            "The question order is layered: broad identity questions come first, category and profile questions follow, and specialist or fine questions are saved for the endgame when they can separate close candidates.",
          ],
        },
        {
          title: "How Guess My Mind works",
          body: [
            "In the reverse ritual, Mora secretly chooses an entity and you explore the answer space through a guided inquiry browser. Instead of dumping every possible clue at once, the game presents small sets of recommended questions by layer and family.",
            "That structure keeps the mode playable on desktop and mobile while still giving skilled players meaningful strategic choices about whether to stay broad, go deeper, switch families, or make a final guess.",
          ],
        },
        {
          title: "Scoring, memory, and privacy",
          body: [
            "Scoring is deterministic and mode-aware. Read My Mind rewards endurance, difficulty, consistency, and stumping Mora fairly. Guess My Mind rewards correct solves, efficient clue use, fewer failed guesses, and higher difficulty.",
            "Chamber Memory stores your local profile, recent games, score history, and teachings. World Rank uses a lightweight anonymous player id and public display name when leaderboard services are configured.",
            "The game avoids sending private answer text, hidden entity names, teach notes, or free-text personal content through analytics by default. The public pages explain the project; the play route is reserved for the interactive ritual.",
          ],
        },
        {
          title: "How the inference is built",
          body: [
            "The chamber runs as a local-first Next.js experience with seeded entities, learned entities, personal history, and public-rank-ready scoring. It keeps the dramatic tone of the chamber while still behaving like a real published web product.",
            "Mora's ranking model uses additive smoothing and calibrated confidence so incomplete profiles do not collapse to zero and uncertain answers do not overpower stronger evidence.",
            "Every major release pass aims to improve question quality, profile coverage, endgame disambiguation, readability, and long-term replayability rather than just piling on decorative UI.",
          ],
        },
      ]}
    />
  );
}
