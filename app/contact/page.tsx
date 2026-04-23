import type { Metadata } from "next";

import { SocialBrandButton } from "@/components/site/social-brand-button";
import { SiteInfoPage } from "@/components/site/site-info-page";
import { siteSocialLinks } from "@/lib/site/footer-links";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the creator of Mind Reader through LinkedIn, GitHub, or Handshake.",
};

export default function ContactPage() {
  return (
    <SiteInfoPage
      eyebrow="Contact us"
      title="Reach the chamber through public channels."
      description="Mind Reader is published and maintained as a public web game. For questions, feedback, collaboration, or press interest, use the creator links below."
      actions={siteSocialLinks.map((social) => (
        <SocialBrandButton
          key={social.label}
          label={social.label}
          href={social.href}
          variant="pill"
        />
      ))}
      sections={[
        {
          title: "Best way to reach out",
          body: [
            "LinkedIn is the best route for professional outreach, collaborations, and broader product conversations.",
            "GitHub is the best route for repository-level context, implementation details, and future technical follow-up around the project.",
            "Handshake is available for career-facing outreach and the public professional profile tied to this release.",
          ],
        },
        {
          title: "What to include",
          body: [
            "If you are writing about Mind Reader, include the page or feature you are referring to, what you expected, and what you would like improved.",
            "If your message is about a deployment, content, or gameplay issue, mention the route and the exact behavior you saw so it can be reproduced cleanly.",
          ],
        },
      ]}
    />
  );
}
