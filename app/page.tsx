import type { Metadata } from "next";

import { LandingPage } from "@/components/game/landing-page";
import { AdSenseLoader } from "@/components/site/adsense-loader";

export const metadata: Metadata = {
  title: "Mind Reader",
  description:
    "Enter Mora's psychic chamber, learn how the mind-reading rituals work, and play a cinematic browser guessing game.",
};

export default function HomePage() {
  return (
    <>
      <AdSenseLoader />
      <LandingPage />
    </>
  );
}
