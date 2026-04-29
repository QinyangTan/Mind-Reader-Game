import type { Metadata } from "next";
import { Alegreya_Sans, Cormorant_Garamond } from "next/font/google";

import "./globals.css";

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mind-reader-game-theta.vercel.app"),
  title: {
    default: "Mind Reader",
    template: "%s | Mind Reader",
  },
  description:
    "A cinematic browser mind-reading ritual with Mora, personal scores, local learning, and public-rank-ready gameplay.",
  applicationName: "Mind Reader",
  authors: [{ name: "Mind Reader" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Mind Reader",
    description:
      "Enter Mora's psychic chamber and play a story-led mind-reading game.",
    type: "website",
    images: ["/scene-pack/clean/landing.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind Reader",
    description: "A cinematic browser mind-reading ritual hosted by Mora.",
    images: ["/scene-pack/clean/landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${alegreyaSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5423711015893224"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
