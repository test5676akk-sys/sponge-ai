import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpongeAI | Neural Defense Protocol",
  description: "The ocean is a dead simulation. Evolutionary AI protocol initiated. Breach the surface. Defend the core.",
  openGraph: {
    title: "SpongeAI",
    description: "Abyssal AI evolution. Preparing for ascension.",
    url: "https://your-domain.com", // Сюда потом впишешь свой домен
    siteName: "SpongeAI",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}