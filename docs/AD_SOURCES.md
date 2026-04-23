# Ad Media Sources

Mind Reader keeps its logo, mascot, and UI art original to this repo. The ad slots now use real public-domain promo creatives cached locally for reliability and labeled in-product as `Example Ad`.

## Imported ad media

| Local file | Used in | Source | License note |
| --- | --- | --- | --- |
| `public/media/ads/example-ad-computer-space.jpg` | Top leaderboard example ad | [Wikimedia Commons: Computer Space (1971) - Promotional flyer](https://commons.wikimedia.org/wiki/File:Computer_Space_(1971)_-_Promotional_flyer.jpg) | Commons hosts the flyer as a public-domain historical promotional image. Mind Reader uses a cached local copy for reliable deployment. |
| `public/media/ads/example-ad-pan-am.jpg` | Left and right rail example ads | [Wikimedia Commons: Fly to the Caribbean by Clipper, Pan American World Airways](https://commons.wikimedia.org/wiki/File:ARENBERG,_Mark_von._Fly_to_the_Caribbean_by_Clipper,_Pan_American_World_Airways._(54312271643).jpg) | Commons marks this restored travel poster as public domain / freely reusable media. Mind Reader caches the image locally and crops it responsively per slot. |
| `public/media/ads/night-railroad-station-1440.jpg` | Legacy scenic sponsor asset kept only as fallback media in older components | [Wikimedia Commons: Nighttime Railroad Station (Unsplash)](https://commons.wikimedia.org/wiki/File:Nighttime_Railroad_Station_(Unsplash).jpg) | Commons lists this file as CC0 / public domain dedication from the pre-2017 Unsplash license. |
| `public/media/ads/photoreal-train-360p.webm` | Legacy example media kept for non-primary sponsor components | [Wikimedia Commons: Photoreal-train.webm](https://commons.wikimedia.org/wiki/File:Photoreal-train.webm) | Commons marks the file public domain. |

## Notes

- All ad copy, labels, timing behavior, layout, styling, and fallback house creatives remain original to this repo.
- No third-party ad network code, trackers, or embeds are included by default.
- The real example creatives are downloaded into the repo instead of hotlinked so the deployed site stays stable.
