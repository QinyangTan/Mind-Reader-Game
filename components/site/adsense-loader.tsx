import Script from "next/script";

export const ADSENSE_CLIENT_ID = "ca-pub-5423711015893224";

export const ADSENSE_ALLOWED_ROUTES = [
  "/",
  "/about",
  "/faq",
  "/press",
  "/privacy",
  "/terms",
  "/legal",
  "/contact",
] as const;

/**
 * Google-served ads are intentionally loaded only on publisher-content pages.
 *
 * Do not mount this component in /play or any game-state surface. Auto ads
 * should also exclude /play* in the AdSense dashboard so gameplay, profile
 * gates, Chamber Memory, World Rank, result screens, and modals stay ad-free.
 */
export function AdSenseLoader() {
  return (
    <Script
      id="google-adsense-public-content"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
