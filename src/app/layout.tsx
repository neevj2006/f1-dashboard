import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apex-f1.local"),
  title: {
    default: "Apex F1 Home",
    template: "%s | Apex F1",
  },
  description: "A modern Formula 1 dashboard with live timing, historical race analytics, standings, constructors, and circuit intelligence.",
  keywords: ["Formula 1", "F1", "race dashboard", "driver standings", "constructor standings"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-black text-zinc-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
