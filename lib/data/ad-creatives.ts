export const adCreativeIds = [
  "computer-space-launch",
  "computer-space-side",
  "pan-am-caribbean-poster",
  "pan-am-caribbean-leaderboard",
] as const;

export type AdCreativeId = (typeof adCreativeIds)[number];

export interface AdCreativeDefinition {
  id: AdCreativeId;
  kind: "image";
  sponsor: string;
  label: string;
  title: string;
  copy: string;
  cta: string;
  src: string;
  alt: string;
  imagePosition?: string;
}

export const adCreatives: Record<AdCreativeId, AdCreativeDefinition> = {
  "computer-space-launch": {
    id: "computer-space-launch",
    kind: "image",
    sponsor: "Nutting Associates",
    label: "Example Ad",
    title: "Computer Space Launch",
    copy: "A real 1971 arcade promo flyer reframed as a tasteful example leaderboard creative.",
    cta: "View classic launch art",
    src: "/media/ads/example-ad-computer-space.jpg",
    alt: "Computer Space 1971 promotional flyer used as a real example ad creative.",
    imagePosition: "50% 36%",
  },
  "computer-space-side": {
    id: "computer-space-side",
    kind: "image",
    sponsor: "Nutting Associates",
    label: "Example Ad",
    title: "Computer Space Cabinet",
    copy: "The original arcade launch flyer is cropped for a separate side-rail example ad with a stronger machine-focused composition.",
    cta: "See arcade flyer source",
    src: "/media/ads/example-ad-computer-space.jpg",
    alt: "Computer Space 1971 promotional flyer cropped as a side-rail example ad creative.",
    imagePosition: "52% 24%",
  },
  "pan-am-caribbean-poster": {
    id: "pan-am-caribbean-poster",
    kind: "image",
    sponsor: "Pan American Airways",
    label: "Example Ad",
    title: "Fly to the Caribbean",
    copy: "A restored Pan Am Clipper poster gives the rail slots a real travel-ad presence without scripts or trackers.",
    cta: "See poster source",
    src: "/media/ads/example-ad-pan-am.jpg",
    alt: "Pan American World Airways Caribbean Clipper travel poster used as a real example ad creative.",
    imagePosition: "50% 22%",
  },
  "pan-am-caribbean-leaderboard": {
    id: "pan-am-caribbean-leaderboard",
    kind: "image",
    sponsor: "Pan American Airways",
    label: "Example Ad",
    title: "Clipper Coast Escape",
    copy: "The same public-domain Pan Am campaign art is cropped for a softer banner treatment above the chamber.",
    cta: "Open poster reference",
    src: "/media/ads/example-ad-pan-am.jpg",
    alt: "Pan Am Caribbean poster cropped into a banner-style example ad.",
    imagePosition: "50% 18%",
  },
};
