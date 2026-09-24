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
  metadataBase: new URL("https://fclbd.vercel.app"),
  title: "Facebook Cricket League (FCL) | Official Digital Platform",
  description:
    "Official digital platform of Facebook Cricket League (FCL). Real-time cricket stats, player profiles, MVP leaderboard, and all-time records.",
  keywords: [
    "FCL",
    "Facebook Cricket League",
    "Virtual Cricket",
    "Cricket Records",
    "FCL MVP",
    "Player Statistics",
  ],
  authors: [{ name: "Arif Ziad" }],
  icons: {
    icon: "/fcl-logo.png",
    shortcut: "/fcl-logo.png",
    apple: "/fcl-logo.png",
  },
  openGraph: {
    title: "Facebook Cricket League (FCL) | Official Digital Platform",
    description: "One Game. One Community. The Game Lives Beyond The Field.",
    url: "https://fclbd.vercel.app",
    siteName: "Facebook Cricket League",
    images: [
      {
        url: "/fcl-logo.png",
        width: 1200,
        height: 630,
        alt: "Facebook Cricket League Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Cricket League (FCL)",
    description: "One Game. One Community. The Game Lives Beyond The Field.",
    images: ["/fcl-logo.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020617] text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}