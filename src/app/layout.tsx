import type { Metadata } from "next";
import "./globals.css";

// ЗАМЕНИ НА СВОЙ РЕАЛЬНЫЙ ДОМЕН
const DOMAIN = "https://spongeai.dev"; 

export const metadata: Metadata = {
  title: "SpongeAI | Neural Defense Protocol",
  description: "Abyssal AI evolution. Breach the surface. Defend the core.",
  metadataBase: new URL(DOMAIN),
  openGraph: {
    title: "SpongeAI | Neural Defense Protocol",
    description: "The ocean is a dead simulation. Prepare for ascension.",
    url: DOMAIN,
    siteName: "SpongeAI",
    images: [
      {
        url: `${DOMAIN}/opengraph-image.jpg`, 
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpongeAI",
    description: "Neural Defense Protocol initiated.",
    images: [`${DOMAIN}/opengraph-image.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#050505]">{children}</body>
    </html>
  );
}