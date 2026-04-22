export const adCreativeIds = [
  "midnight-platform-poster",
  "moonline-preview-video",
] as const;

export type AdCreativeId = (typeof adCreativeIds)[number];

export interface AdCreativeDefinition {
  id: AdCreativeId;
  kind: "image" | "video";
  sponsor: string;
  label: string;
  title: string;
  copy: string;
  cta: string;
  src: string;
  poster?: string;
  alt: string;
}

export const adCreatives: Record<AdCreativeId, AdCreativeDefinition> = {
  "midnight-platform-poster": {
    id: "midnight-platform-poster",
    kind: "image",
    sponsor: "Moonline Rail",
    label: "Scenic sponsor",
    title: "Night Platform Pass",
    copy: "A cinematic station poster keeps the rail looking lived-in without crowding the play stage.",
    cta: "See the route",
    src: "/media/ads/night-railroad-station-1440.jpg",
    alt: "Nighttime railroad station poster creative used as a scenic sponsor placeholder.",
  },
  "moonline-preview-video": {
    id: "moonline-preview-video",
    kind: "video",
    sponsor: "Moonline Rail",
    label: "Video sponsor",
    title: "Mountain Line Preview",
    copy: "A short muted rail clip demonstrates how a tasteful video placement can live in the sponsor rail.",
    cta: "Watch preview",
    src: "/media/ads/photoreal-train-360p.webm",
    poster: "/media/ads/night-railroad-station-1440.jpg",
    alt: "Muted train video preview used as a sponsor example inside the Mind Reader rail.",
  },
};
