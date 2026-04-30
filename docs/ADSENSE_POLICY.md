# AdSense Placement Policy

Mind Reader separates publisher-content pages from interactive gameplay screens.

## Where Google AdSense Loads

The controlled `AdSenseLoader` component may load the Google AdSense script only on content-rich public pages:

- `/`
- `/about`
- `/faq`
- `/press`
- `/privacy`
- `/terms`
- `/legal`
- `/contact`

These routes contain public-site information about the project, gameplay modes, scoring, privacy, leaderboard behavior, press context, and legal/FAQ material.

## Where Google AdSense Must Not Load

Google-served ads are intentionally disabled on:

- `/play`
- active gameplay screens
- the first-time profile gate
- Chamber Memory
- World Rank
- reveal/result screens
- teach flow
- modals
- purely navigational ritual screens

This avoids Google-served ads appearing on screens without publisher content.

## AdSense Dashboard Requirement

In the Google AdSense dashboard, Auto ads should explicitly exclude:

```text
/play*
```

This route-level exclusion is required because the browser game uses client-side scene changes inside `/play`, and those scenes are gameplay UI rather than publisher articles or informational content.

## In-Game Example Ads

The top, left, and right in-game sponsor placements are local, cached, non-Google example creatives. They are labeled `Non-Google Example Ad`, do not use `adsbygoogle`, do not load ad-network scripts, and remain outside the safe gameplay area.
